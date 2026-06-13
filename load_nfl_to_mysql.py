from pathlib import Path
from io import StringIO

import pandas as pd
from sqlalchemy import create_engine


MYSQL_USER = "root"
MYSQL_PASSWORD = "administrador"
MYSQL_HOST = "localhost"
MYSQL_PORT = "3306"
MYSQL_DATABASE = "nfl_db"

BASE_DIR = Path(__file__).parent
PAGES_DIR = BASE_DIR / "data" / "pages"


def make_unique_columns(columns):
    seen = {}
    unique_columns = []

    for col in columns:
        col = str(col).strip()

        if col not in seen:
            seen[col] = 0
            unique_columns.append(col)
        else:
            seen[col] += 1
            unique_columns.append(f"{col}.{seen[col]}")

    return unique_columns


def flatten_columns(df):
    new_columns = []

    for col in df.columns:
        if isinstance(col, tuple):
            parts = [str(part).strip() for part in col]

            chosen = None

            for part in reversed(parts):
                if part and not part.startswith("Unnamed"):
                    chosen = part
                    break

            if chosen is None:
                chosen = parts[-1]

            new_columns.append(chosen)
        else:
            new_columns.append(str(col).strip())

    df.columns = make_unique_columns(new_columns)
    return df


def read_tables_from_file(file_path):
    print(f"Leyendo archivo local: {file_path}")

    html = file_path.read_text(encoding="utf-8", errors="ignore")

    # Pro Football Reference a veces esconde tablas dentro de comentarios HTML.
    html = html.replace("<!--", "").replace("-->", "")

    tables = pd.read_html(StringIO(html))

    clean_tables = []

    for table in tables:
        table = flatten_columns(table)
        clean_tables.append(table)

    return clean_tables


def clean_team_name(name):
    if pd.isna(name):
        return name

    return (
        str(name)
        .replace("*", "")
        .replace("+", "")
        .strip()
    )


def get_available_years():
    years = []

    for file in PAGES_DIR.glob("*.html"):
        name = file.stem

        if name.isdigit():
            games_file = PAGES_DIR / f"{name}_games.html"

            if games_file.exists():
                years.append(int(name))

    return sorted(years)


def load_team_seasons(years):
    all_rows = []

    for season in years:
        file_path = PAGES_DIR / f"{season}.html"
        tables = read_tables_from_file(file_path)

        standings_tables = []

        for table in tables:
            cols = set(table.columns)

            if {"Tm", "W", "L", "PF", "PA"}.issubset(cols):
                standings_tables.append(table)

        print(f"Temporada {season}: tablas de standings encontradas: {len(standings_tables)}")

        for index, table in enumerate(standings_tables[:2]):
            conference = "AFC" if index == 0 else "NFC"

            df = table.copy()

            df["season"] = season
            df["conference"] = conference

            df["made_playoffs"] = df["Tm"].astype(str).str.contains(r"\*|\+", regex=True)
            df["division_winner"] = df["Tm"].astype(str).str.contains(r"\+", regex=True)
            df["team"] = df["Tm"].apply(clean_team_name)

            numeric_columns = [
                "W",
                "L",
                "T",
                "W-L%",
                "PF",
                "PA",
                "PD",
                "MoV",
                "SoS",
                "SRS",
                "OSRS",
                "DSRS"
            ]

            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce")

            df = df[pd.to_numeric(df["W"], errors="coerce").notna()]

            rename_map = {
                "W": "wins",
                "L": "losses",
                "T": "ties",
                "W-L%": "win_percentage",
                "PF": "points_for",
                "PA": "points_against",
                "PD": "point_differential",
                "MoV": "margin_of_victory",
                "SoS": "strength_of_schedule",
                "SRS": "simple_rating",
                "OSRS": "offensive_rating",
                "DSRS": "defensive_rating"
            }

            df = df.rename(columns=rename_map)

            keep_columns = [
                "season",
                "conference",
                "team",
                "wins",
                "losses",
                "ties",
                "win_percentage",
                "points_for",
                "points_against",
                "point_differential",
                "margin_of_victory",
                "strength_of_schedule",
                "simple_rating",
                "offensive_rating",
                "defensive_rating",
                "made_playoffs",
                "division_winner"
            ]

            for col in keep_columns:
                if col not in df.columns:
                    df[col] = None

            all_rows.append(df[keep_columns])

    if not all_rows:
        return pd.DataFrame()

    return pd.concat(all_rows, ignore_index=True)


def load_games(years):
    all_rows = []

    for season in years:
        file_path = PAGES_DIR / f"{season}_games.html"
        tables = read_tables_from_file(file_path)

        games_table = None

        for table in tables:
            cols = set(table.columns)

            if "Winner/tie" in cols and "Loser/tie" in cols:
                games_table = table
                break

        if games_table is None:
            print(f"No se encontró tabla de juegos para {season}")
            continue

        df = games_table.copy()

        # Quitar filas repetidas de encabezado
        df = df[df["Week"].astype(str) != "Week"]

        df["season"] = season

        # Después de hacer únicas las columnas, Pro Football Reference puede dejar:
        # Pts y Pts.1 para puntos del ganador y perdedor.
        rename_map = {
            "Week": "week",
            "Day": "day",
            "Date": "game_date",
            "Time": "game_time",
            "Winner/tie": "winner",
            "Loser/tie": "loser",

            "PtsW": "winner_points",
            "PtsL": "loser_points",
            "Pts": "winner_points",
            "Pts.1": "loser_points",

            "YdsW": "winner_yards",
            "TOW": "winner_turnovers",
            "YdsL": "loser_yards",
            "TOL": "loser_turnovers"
        }

        df = df.rename(columns=rename_map)

        # Columna de local/visitante. En PFR normalmente "@" significa que el ganador fue visitante.
        if "@" in df.columns:
            df = df.rename(columns={"@": "location"})
        elif "Unnamed: 5" in df.columns:
            df = df.rename(columns={"Unnamed: 5": "location"})
        elif "Unnamed: 5_level_1" in df.columns:
            df = df.rename(columns={"Unnamed: 5_level_1": "location"})
        else:
            df["location"] = ""

        keep_columns = [
            "season",
            "week",
            "day",
            "game_date",
            "game_time",
            "winner",
            "location",
            "loser",
            "winner_points",
            "loser_points",
            "winner_yards",
            "winner_turnovers",
            "loser_yards",
            "loser_turnovers"
        ]

        for col in keep_columns:
            if col not in df.columns:
                df[col] = None

        numeric_columns = [
            "winner_points",
            "loser_points",
            "winner_yards",
            "winner_turnovers",
            "loser_yards",
            "loser_turnovers"
        ]

        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        all_rows.append(df[keep_columns])

    if not all_rows:
        return pd.DataFrame()

    return pd.concat(all_rows, ignore_index=True)


def main():
    years = get_available_years()

    print("Años encontrados:", years)

    if not years:
        print("No se encontraron archivos HTML válidos en data/pages.")
        print("Necesitas archivos como 2024.html y 2024_games.html.")
        return

    engine = create_engine(
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    )

    print("Cargando temporadas de equipos...")
    team_seasons = load_team_seasons(years)

    print("Filas de team_seasons:", len(team_seasons))

    team_seasons.to_sql(
        name="team_seasons",
        con=engine,
        if_exists="replace",
        index=False,
        chunksize=1000
    )

    print("Cargando juegos...")
    games = load_games(years)

    print("Filas de games:", len(games))

    games.to_sql(
        name="games",
        con=engine,
        if_exists="replace",
        index=False,
        chunksize=1000
    )

    print("Listo. Datos cargados en MySQL.")
    print("Tablas creadas:")
    print("- team_seasons")
    print("- games")


if __name__ == "__main__":
    main()
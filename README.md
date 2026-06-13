# NFL Historical Stats Explorer

## Descripción

NFL Historical Stats Explorer es una aplicación web que permite consultar estadísticas históricas de la NFL usando una base de datos MySQL, un backend en Node.js/Express y un frontend en HTML, CSS y JavaScript.

El proyecto utiliza datos obtenidos desde Pro Football Reference correspondientes a las temporadas 2020, 2021, 2022, 2023 y 2024. Los datos fueron guardados como archivos HTML locales, procesados con Python y cargados posteriormente a MySQL.

## Tecnologías utilizadas

* MySQL
* MySQL Workbench
* Python
* Pandas
* SQLAlchemy
* PyMySQL
* Node.js
* Express
* MySQL2
* CORS
* Dotenv
* HTML
* CSS
* JavaScript

## Estructura del proyecto

```text
nfl-api/
├─ backend/
│  ├─ config/
│  │  └─ db.js
│  ├─ controllers/
│  │  └─ nflController.js
│  ├─ models/
│  │  └─ nflModel.js
│  ├─ routes/
│  │  └─ nflRoutes.js
│  ├─ .env.example
│  ├─ index.js
│  └─ package.json
│
├─ frontend/
│  └─ index.html
│
├─ data/
│  └─ pages/
│     ├─ 2020.html
│     ├─ 2020_games.html
│     ├─ 2021.html
│     ├─ 2021_games.html
│     ├─ 2022.html
│     ├─ 2022_games.html
│     ├─ 2023.html
│     ├─ 2023_games.html
│     ├─ 2024.html
│     └─ 2024_games.html
│
├─ load_nfl_to_mysql.py
├─ README.md
├─ ABRIR_PRIMERO.txt
└─ .gitignore
```

## Base de datos

La base de datos utilizada se llama:

```sql
nfl_db
```

El proyecto contiene dos tablas principales:

```text
team_seasons
games
```

La tabla `team_seasons` contiene estadísticas por equipo y temporada, como victorias, derrotas, puntos anotados, puntos permitidos y diferencial de puntos.

La tabla `games` contiene información de partidos, como temporada, semana, fecha, ganador, perdedor, marcador, yardas y puntos totales.

## Cantidad de datos cargados

El proyecto contiene datos de 5 temporadas de la NFL:

```text
2020, 2021, 2022, 2023, 2024
```

Registros cargados:

```text
team_seasons: 160 registros
games: 1,408 registros
```

## Consultas disponibles en la aplicación

La aplicación permite realizar consultas como:

* Ver estadísticas generales de la base de datos.
* Consultar los equipos con más victorias.
* Consultar las mejores ofensivas por puntos anotados.
* Consultar las mejores defensivas por puntos permitidos.
* Consultar equipos con mejor diferencial de puntos.
* Buscar equipos por nombre.
* Buscar partidos por equipo.
* Ver partidos por temporada.
* Ver partidos con más puntos.
* Ver partidos más cerrados.

## Rutas principales de la API

```text
GET /api
GET /api/stats
GET /api/teams/top-wins
GET /api/teams/top-offenses
GET /api/teams/top-defenses
GET /api/teams/best-differential
GET /api/teams/search?q=Chiefs
GET /api/games/season/2024
GET /api/games/search?q=Chiefs
GET /api/games/high-scoring
GET /api/games/close-games
```

## Cómo ejecutar el proyecto

### 1. Crear la base de datos en MySQL

En MySQL Workbench ejecutar:

```sql
CREATE DATABASE nfl_db;
USE nfl_db;
```

### 2. Cargar los datos a MySQL

Desde la carpeta principal del proyecto ejecutar:

```cmd
py load_nfl_to_mysql.py
```

Este script lee los archivos HTML guardados en `data/pages`, procesa las tablas con Python y carga los datos a MySQL.

### 3. Configurar el backend

Entrar a la carpeta del backend:

```cmd
cd backend
```

Instalar dependencias:

```cmd
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=nfl_db
DB_PORT=3306
PORT=3000
```

### 4. Ejecutar el backend

Dentro de la carpeta `backend`, ejecutar:

```cmd
node index.js
```

El backend debe iniciar en:

```text
http://localhost:3000
```

### 5. Abrir el frontend

Abrir el archivo:

```text
frontend/index.html
```

El frontend consume la API local y muestra las consultas en una interfaz visual.

## Explicación general

Este proyecto demuestra el uso de una base de datos MySQL conectada a un backend en Node.js/Express. El backend consulta los datos usando modelos, controladores y rutas, y devuelve la información en formato JSON. El frontend consume esos datos y los muestra en una página web con botones, buscador y tarjetas de resultados.

El objetivo del sistema es permitir consultar estadísticas históricas recientes de la NFL de una manera clara, rápida y organizada.

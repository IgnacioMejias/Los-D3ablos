import json
from nba_api.stats.static import teams
from nba_api.stats.endpoints import teamyearbyyearstats
import pandas as pd

# Tu lista de equipos
team_names = [
    'Atlanta Hawks',
    'Boston Celtics',
    'Brooklyn Nets',
    'Charlotte Hornets',
    'Chicago Bulls',
    'Cleveland Cavaliers',
    'Dallas Mavericks',
    'Denver Nuggets',
    'Detroit Pistons',
    'Golden State Warriors',
    'Houston Rockets',
    'Indiana Pacers',
    'Los Angeles Clippers',
    'Los Angeles Lakers',
    'Memphis Grizzlies',
    'Miami Heat',
    'Milwaukee Bucks',
    'Minnesota Timberwolves',
    'New Orleans Pelicans',
    'New York Knicks',
    'Oklahoma City Thunder',
    'Orlando Magic',
    'Philadelphia 76ers',
    'Phoenix Suns',
    'Portland Trail Blazers',
    'Sacramento Kings',
    'San Antonio Spurs',
    'Toronto Raptors',
    'Utah Jazz',
    'Washington Wizards'
]

# Obtén la lista de todos los equipos
all_teams = teams.get_teams()

# Crea un diccionario vacío para almacenar los datos de puntos por temporada de cada equipo
points_per_season_by_team = {}

# Itera sobre los equipos en tu lista
for team_name in team_names:
    # Obtiene el ID del equipo
    team_id = [team for team in all_teams if team['full_name'] == team_name][0]['id']

    # Obtiene las estadísticas de cada temporada del equipo
    team_stats = teamyearbyyearstats.TeamYearByYearStats(team_id=team_id, season_type_all_star='Regular Season')

    # Obtiene los datos en formato DataFrame
    df = team_stats.get_data_frames()[0]
    df = df[df['YEAR'] >= '1980']

    # Agrupa los puntos por temporada
    points_per_season = df.groupby('YEAR')['PTS'].sum()

    # Elimina el número después del guion en las claves del diccionario
    modified_points_per_season = {}
    for key, value in points_per_season.items():
        modified_key = key.split('-')[0]
        modified_points_per_season[modified_key] = value

    # Almacena los datos en el diccionario principal
    points_per_season_by_team[team_name] = modified_points_per_season

# Escribe los datos en un archivo JSON con formato más legible para humanos
with open('team_points_per_season.json', 'w') as f:
    json.dump(points_per_season_by_team, f, indent=4)

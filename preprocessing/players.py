import json
from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog
import pandas as pd
# Tu lista de jugadores
player_names = ['LeBron James', 'Kareem Abdul-Jabbar', 'Karl Malone', 'Kobe Bryant', 'Michael Jordan', 'Dirk Nowitzki', 'Wilt Chamberlain', "Shaquille O'Neal", 'Carmelo Anthony', 'Moses Malone']
# Obtiene la lista de todos los jugadores
all_players = players.get_players()

# Crear un diccionario vacío para almacenar los datos de todos los jugadores
all_players_data = {}

# Itera sobre los nombres de los jugadores en tu lista
for player_name in player_names:
    # Obtiene el ID del jugador
    player_id = [player for player in all_players if player['full_name'] == player_name][0]['id']

    # Obtiene las estadísticas de los partidos del jugador
    gamelog = playergamelog.PlayerGameLog(player_id=player_id, season = 'ALL')

    # Obtiene los datos en formato DataFrame
    df = gamelog.get_data_frames()[0]

    # Convierte la columna SEASON_ID a un formato más legible
    df['SEASON_ID'] = df['SEASON_ID'].apply(lambda x: str(int(x[1:])+1) + "-" + x[1:])

    # Suma los puntos por temporada
    points_per_season = df.groupby('SEASON_ID')['PTS'].sum()

    # Almacena los datos en el diccionario principal
    all_players_data[player_name] = points_per_season.to_dict()

# Escribir los datos en un archivo JSON con formato más legible para humanos
with open('players_data.json', 'w') as f:
    json.dump(all_players_data, f, indent=4)


from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog
import pandas as pd

# Tu lista de jugadores
player_names = ['LeBron James', 'Kareem Abdul-Jabbar', 'Karl Malone', 'Kobe Bryant', 'Michael Jordan', 'Dirk Nowitzki', 'Wilt Chamberlain', "Shaquille O'Neal", 'Carmelo Anthony', 'Moses Malone']
# Obtiene la lista de todos los jugadores
all_players = players.get_players()

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

    # Imprime todas las temporadas disponibles
    print(f"Temporadas disponibles para {player_name}:")
    print(df['SEASON_ID'].unique())

    # Suma los puntos por temporada
    points_per_season = df.groupby('SEASON_ID')['PTS'].sum()

    # Muestra los puntos por temporada
    print(f"\nPuntos por temporada para {player_name}:")
    print(points_per_season)
    print("\n")


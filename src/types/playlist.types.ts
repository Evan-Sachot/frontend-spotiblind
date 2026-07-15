export type SpotifyPlaylist = {
  id: string;
  name: string;
  imageUrl: string;
  trackCount: number;
};

export type PlaylistSelectorProps = {
  playlists: SpotifyPlaylist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  isLoading: boolean;
};
// frontend/src/components/focus/JellyfinBrowser.jsx
import React, { useState, useEffect } from 'react';
import {
  IoSearch,
  IoClose,
  IoMusicalNotes,
  IoChevronBack,
} from 'react-icons/io5';
import {
  searchMusic,
  getStreamUrl,
  getCoverArtUrl,
  getArtists,
  getArtist,
  getAlbum,
  getSong,
} from '../../api/jellyfinAPI';
import styles from './JellyfinBrowser.module.css';

const JellyfinBrowser = ({ onSelectTrack, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ artists: [], albums: [], songs: [] });
  const [libraryArtists, setLibraryArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('albums');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setIsLoading(true);
      const artists = await getArtists();
      const limit = 30;
      const subset = artists.slice(0, limit);
      const details = await Promise.all(
        subset.map((artist) => getArtist(artist.id).catch(() => null)),
      );

      const collected = [];
      details.forEach((detail) => {
        if (detail && Array.isArray(detail.album)) {
          detail.album.forEach((album) => {
            collected.push({
              ...album,
              artistName: detail.name,
            });
          });
        }
      });

      setAlbums(collected);
    } catch (error) {
      console.error('Failed to load albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      const artists = await getArtists();
      setLibraryArtists(artists);
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectArtist = async (artist) => {
    try {
      setIsLoading(true);
      const artistDetails = await getArtist(artist.id);
      setSelectedArtist(artistDetails);
      setSelectedArtistAlbums(artistDetails.album || []);
    } catch (error) {
      console.error('Failed to load artist details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAlbum = async (album) => {
    try {
      setIsLoading(true);
      const albumDetails = await getAlbum(album.id);
      setSelectedAlbum(albumDetails);
      setSelectedAlbumSongs(albumDetails.song || []);
    } catch (error) {
      console.error('Failed to load album details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setSelectedAlbumSongs([]);
  };

  const buildTrackPayload = async (item) => {
    const itemId = item.id || item.songId || item.song_id;
    let song = item;
    if (!song.title || !song.artist || !song.album) {
      try {
        song = await getSong(itemId);
      } catch (error) {
        console.warn('Could not fetch full song details, falling back to partial item', error);
      }
    }

    const coverArtId = song.coverArt || item.coverArt;
    return {
      id: itemId,
      title: song.title || item.title || 'Unknown Track',
      artist: song.artist || item.artist || item.artistName || selectedArtist?.name || selectedAlbum?.artist || 'Unknown Artist',
      album: song.album || item.album || selectedAlbum?.name || selectedArtist?.name || 'Unknown Album',
      coverArt: coverArtId ? getCoverArtUrl(coverArtId) : null,
      streamUrl: getStreamUrl(itemId),
      sourceType: 'jellyfin',
      jellyfinId: itemId,
    };
  };

  const handleBackToArtists = () => {
    setSelectedArtist(null);
    setSelectedArtistAlbums([]);
  };

  const handleSelectTrack = async (item) => {
    try {
      setIsLoading(true);
      const trackPayload = await buildTrackPayload(item);
      onSelectTrack(trackPayload);
      onClose();
    } catch (error) {
      console.error('Failed to prepare track:', error);
      alert('Failed to load track');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const data = await searchMusic(searchQuery, { songCount: 30 });
      setResults(data);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSongList = (songs, title) => {
    if (!songs || songs.length === 0) return null;

    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <ul className={styles.songList}>
          {songs.map((song) => (
            <li
              key={song.id}
              className={styles.songItem}
              onClick={() => handleSelectTrack(song)}
            >
              <div className={styles.songIcon}>
                {song.coverArt ? (
                  <img
                    src={getCoverArtUrl(song.coverArt)}
                    alt={song.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <IoMusicalNotes size={20} />
                )}
              </div>
              <div className={styles.songDetails}>
                <p className={styles.songTitle}>{song.title}</p>
                <p className={styles.songArtist}>{song.artist || 'Unknown Artist'}</p>
              </div>
              <span className={styles.duration}>
                {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.browser}>
      <div className={styles.header}>
        <h2>Music Browser</h2>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close browser">
          <IoClose />
        </button>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn} disabled={isLoading}>
          <IoSearch />
        </button>
      </form>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'albums' ? styles.active : ''}`}
          onClick={() => setActiveTab('albums')}
        >
          Albums
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'library' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('library');
            loadLibrary();
          }}
        >
          Artists
        </button>
        {results.songs?.length > 0 && (
          <button
            className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Results
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading...</p>
          </div>
        ) : activeTab === 'library' ? (
          <>
            {selectedArtist ? (
              <>
                <button className={styles.backBtn} onClick={handleBackToArtists}>
                  <IoChevronBack /> Back to Artists
                </button>
                <h3 className={styles.sectionTitle}>{selectedArtist.name}</h3>
                {selectedArtistAlbums && selectedArtistAlbums.length > 0 ? (
                  <div className={styles.albumGrid}>
                    {selectedArtistAlbums.map((album) => (
                      <div key={album.id} className={styles.albumCard} onClick={() => handleSelectAlbum(album)}>
                        <div className={styles.albumImage}>
                          {album.coverArt ? (
                            <img src={getCoverArtUrl(album.coverArt)} alt={album.name} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <IoMusicalNotes size={32} />
                          )}
                        </div>
                        <p className={styles.albumName}>{album.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No albums found for this artist</p>
                )}
              </>
            ) : (
              <>
                <h3 className={styles.sectionTitle}>Library - Artists</h3>
                {libraryArtists && libraryArtists.length > 0 ? (
                  <div className={styles.artistGrid}>
                    {libraryArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className={styles.artistCard}
                        onClick={() => handleSelectArtist(artist)}
                      >
                        <div className={styles.artistImage}>
                          {artist.coverArt ? (
                            <img src={getCoverArtUrl(artist.coverArt)} alt={artist.name} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <IoMusicalNotes size={32} />
                          )}
                        </div>
                        <p className={styles.artistName}>{artist.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No artists found</p>
                )}
              </>
            )}
          </>
        ) : activeTab === 'albums' ? (
          <>
            {selectedAlbum ? (
              <>
                <button className={styles.backBtn} onClick={handleBackToAlbums}>
                  <IoChevronBack /> Back to Albums
                </button>
                <div className={styles.albumDetailHeader}>
                  <h3 className={styles.sectionTitle}>{selectedAlbum.name}</h3>
                  {selectedAlbumSongs && selectedAlbumSongs.length > 0 && (
                    <button
                      className={styles.playAlbumBtn}
                      onClick={() => handleSelectTrack(selectedAlbumSongs[0])}
                    >
                      Play First Track
                    </button>
                  )}
                </div>
                {selectedAlbumSongs && selectedAlbumSongs.length > 0 ? (
                  <ul className={styles.songList}>
                    {selectedAlbumSongs.map((song) => (
                      <li key={song.id} className={styles.songItem} onClick={() => handleSelectTrack(song)}>
                        <div className={styles.songIcon}>
                          {song.coverArt ? (
                            <img src={getCoverArtUrl(song.coverArt)} alt={song.title} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <IoMusicalNotes size={20} />
                          )}
                        </div>
                        <div className={styles.songDetails}>
                          <p className={styles.songTitle}>{song.title}</p>
                          <p className={styles.songArtist}>{song.artist || selectedAlbum.artistName}</p>
                        </div>
                        <span className={styles.duration}>{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>No songs in this album</p>
                )}
              </>
            ) : (
              <>
                <h3 className={styles.sectionTitle}>Albums</h3>
                {albums && albums.length > 0 ? (
                  <div className={styles.albumGrid}>
                    {albums.map((album) => (
                      <div key={album.id} className={styles.albumCard} onClick={() => handleSelectAlbum(album)}>
                        <div className={styles.albumImage}>
                          {album.coverArt ? (
                            <img src={getCoverArtUrl(album.coverArt)} alt={album.name} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <IoMusicalNotes size={32} />
                          )}
                        </div>
                        <p className={styles.albumName}>{album.name}</p>
                        {album.artistName && <p className={styles.albumArtist}>{album.artistName}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No albums found</p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {renderSongList(results.songs, `${results.songs?.length || 0} Songs Found`)}
            {results.artists?.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Artists</h3>
                <div className={styles.artistGrid}>
                  {results.artists.map((artist) => (
                    <div key={artist.id} className={styles.artistCard}>
                      <div className={styles.artistImage}>
                        {artist.coverArt ? (
                          <img src={getCoverArtUrl(artist.coverArt)} alt={artist.name} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <IoMusicalNotes size={32} />
                        )}
                      </div>
                      <p className={styles.artistName}>{artist.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JellyfinBrowser;

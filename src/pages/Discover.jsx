import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AlbumCard from '@/components/AlbumCard';
import { genreLabels } from '@/components/GenreBadge';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

export default function Discover() {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ title: '', artist: '', genre: '', release_year: '', description: '', cover_url: '' });
  
  const queryClient = useQueryClient();

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: () => base44.entities.Album.list('-created_date', 100),
  });

  const createAlbumMutation = useMutation({
    mutationFn: (data) => base44.entities.Album.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      setShowAddDialog(false);
      setNewAlbum({ title: '', artist: '', genre: '', release_year: '', description: '', cover_url: '' });
    },
  });

  const filtered = albums.filter((a) => {
    const matchSearch = !search || 
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.artist?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === 'all' || a.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAlbumMutation.mutate({
      ...newAlbum,
      release_year: newAlbum.release_year ? Number(newAlbum.release_year) : undefined,
      avg_rating: 0,
      review_count: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discover Albums</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Album
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={newAlbum.title} onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Artist *</Label>
                <Input value={newAlbum.artist} onChange={(e) => setNewAlbum({...newAlbum, artist: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select value={newAlbum.genre} onValueChange={(v) => setNewAlbum({...newAlbum, genre: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(genreLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={newAlbum.release_year} onChange={(e) => setNewAlbum({...newAlbum, release_year: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={newAlbum.cover_url} onChange={(e) => setNewAlbum({...newAlbum, cover_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newAlbum.description} onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})} rows={3} />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={createAlbumMutation.isPending}>
                {createAlbumMutation.isPending ? 'Adding...' : 'Add Album'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search albums or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-40 rounded-xl">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {Object.entries(genreLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No albums found. Try a different search or add one!</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabase';
import { useAuth } from '../_components/AuthProvider';
import ProtectedRoute from '../_components/ProtectedRoute';
import AppHeader from '../_components/AppHeader';
import RecipeCard from '../_components/RecipeCard';
import RecipeFormModal from '../_components/RecipeFormModal';
import PhotoRecipeModal from '../_components/PhotoRecipeModal';
import UrlRecipeModal from '../_components/UrlRecipeModal';
import AddRecipeMethodPicker from '../_components/AddRecipeMethodPicker';

const CAN_EDIT = ['owner', 'editor'];

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  notes?: string;
  tags?: string[];
  photo_url?: string;
  created_at: string;
}

function RecipesContent() {
  const { session, role } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favourites, setFavourites] = useState(new Set<string>());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [addMethod, setAddMethod] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<object | null>(null);

  const canEdit = CAN_EDIT.includes(role ?? '');

  useEffect(() => {
    async function load() {
      const [{ data: recipeData }, { data: favData }] = await Promise.all([
        supabase.from('recipes').select('*').order('created_at', { ascending: false }),
        supabase.from('favorites').select('recipe_id').eq('user_id', session!.user.id),
      ]);
      setRecipes(recipeData ?? []);
      setFavourites(new Set((favData ?? []).map((f: { recipe_id: string }) => f.recipe_id)));
      setLoading(false);
    }
    load();
  }, [session]);

  async function handleToggleFavourite(recipeId: string) {
    const isFav = favourites.has(recipeId);
    setFavourites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
    if (isFav) {
      await supabase.from('favorites').delete().match({ user_id: session!.user.id, recipe_id: recipeId });
    } else {
      await supabase.from('favorites').insert({ user_id: session!.user.id, recipe_id: recipeId });
    }
  }

  function handleMethodSelect(method: string) {
    setShowPicker(false);
    setAddMethod(method);
  }

  function handleBack() {
    setAddMethod(null);
    setShowPicker(true);
  }

  function handleClose() {
    setAddMethod(null);
    setShowPicker(false);
    setPrefillData(null);
  }

  function handleUrlExtracted(data: object) {
    setPrefillData(data);
    setAddMethod('manual');
  }

  async function handleSave() {
    setAddMethod(null);
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    setRecipes(data ?? []);
  }

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.ingredients.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <AppHeader title="Recipes" />

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ingredient…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          {canEdit && (
            <button
              onClick={() => setShowPicker(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-4 rounded-xl transition whitespace-nowrap"
            >
              + Add Recipe
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            {search ? 'No recipes match your search.' : 'No recipes yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavourite={favourites.has(recipe.id)}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}
          </div>
        )}
      </div>

      {showPicker && (
        <AddRecipeMethodPicker onSelect={handleMethodSelect} onClose={handleClose} />
      )}

      {addMethod === 'manual' && (
        <RecipeFormModal
          recipe={null}
          initialData={prefillData as never}
          onSave={handleSave}
          onClose={handleClose}
          onBack={prefillData ? undefined : handleBack}
        />
      )}

      {addMethod === 'photo' && (
        <PhotoRecipeModal onSave={handleSave} onClose={handleClose} onBack={handleBack} />
      )}

      {addMethod === 'url' && (
        <UrlRecipeModal onExtracted={handleUrlExtracted} onClose={handleClose} onBack={handleBack} />
      )}
    </div>
  );
}

export default function RecipesPage() {
  return (
    <ProtectedRoute>
      <RecipesContent />
    </ProtectedRoute>
  );
}

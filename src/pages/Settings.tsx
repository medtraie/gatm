import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  Database,
  History,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const { exportData, importData, clearAllData } = useApp();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importData(content);
    };
    reader.readAsText(importFile);
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    // Simulate update check and refresh
    setTimeout(() => {
      window.location.reload();
      setIsUpdating(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Gestion des données et configuration du système
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Backup & Export */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Sauvegarde & Export</CardTitle>
                <CardDescription>Téléchargez une copie de toutes vos données</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-slate-500">
              Il est recommandé de télécharger régulièrement une sauvegarde de vos données pour éviter toute perte accidentelle.
            </p>
            <Button 
              onClick={exportData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold transition-all shadow-md shadow-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le Backup (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Restaurer des données</CardTitle>
                <CardDescription>Importer des données depuis un fichier backup</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-file">Fichier Backup (.json)</Label>
                <Input 
                  id="backup-file" 
                  type="file" 
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
              <Button 
                type="submit"
                disabled={!importFile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Restaurer les données
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Update */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Mise à jour</CardTitle>
                <CardDescription>Vérifier les mises à jour du système</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Version Actuelle</p>
                  <p className="text-xs text-slate-500">v1.0.0 (Dernière version)</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">À jour</Badge>
            </div>
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Vérification...' : 'Vérifier la mise à jour'}
            </Button>
          </CardContent>
        </Card>

        {/* Dangerous Zone */}
        <Card className="border-none shadow-sm overflow-hidden border-2 border-rose-100">
          <CardHeader className="bg-rose-50 border-b border-rose-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-rose-900">Zone de Danger</CardTitle>
                <CardDescription className="text-rose-600">Actions irréversibles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <p className="text-sm text-rose-800 font-medium">
                La suppression de toutes les données effacera définitivement tout le contenu du stockage local. Cette action ne peut pas être annulée.
              </p>
            </div>
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="w-full h-12 rounded-xl font-bold shadow-md shadow-rose-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Tout supprimer (Réinitialiser)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
          <History className="w-3 h-3" />
          Dernière modification: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Settings;

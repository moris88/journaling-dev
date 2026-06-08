import type { JournalEntry } from "../types";

/**
 * Esporta i dati in un file JSON e avvia il download nel browser
 */
export function exportToJson(data: JournalEntry[], fileName: string = 'journal-backup.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gestisce l'importazione di un file JSON
 */
export function importFromJson(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (err) {
        reject(new Error("File JSON non valido"));
      }
    };
    reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
    reader.readAsText(file);
  });
}

export interface Recipe {
  resep_id: string;
  nama_resep: string;
  deskripsi_resep: string;
  waktu_masak: number;
  bahan: string;
  cara_masak: string;
  image_url: string;
  protein: boolean;
  lemak: boolean;
  karbohidrat: boolean;
}

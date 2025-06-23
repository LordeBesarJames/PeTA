// types/tambah-anak/anak.ts
export interface ChildData {
  id: string;
  name: string;
  weight: number;
  height: number;
  birthDate: Date;
  gender: "Laki-laki" | "Perempuan";
}

export interface CreateChildRequest {
  nama_anak: string;
  berat_anak: number;
  tinggi_anak: number;
  tanggal_lahir: string;
  jenis_kelamin: string;
}

export interface UpdateChildRequest extends CreateChildRequest {
  id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

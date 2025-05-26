import Navbar from "@/components/navbar";

export default function TambahAnakPage() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-5">
        <h1 className="text-xl sm:text-3xl font-bold mb-6">Data Anak</h1>
        <div className="min-h-screen bg-white">
          <div className="mb-8 bg-[#BBD8A3] rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-center relative overflow-hidden min-h-[250px]">
            <div className="hidden md:block absolute left-0 h-full">
              <img
                src="/image/gambar-anak.png"
                alt="Peta"
                className="w-full h-full object-cover rounded-l-lg scale-100"
              />
            </div>

            <div className="flex-1 sm:pl-10 z-10 text-center sm:text-left">
              <h2 className="text-3xl sm:text-5xl font-semibold mb-6 text-white">
                Buat Data Anak Anda!{" "}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

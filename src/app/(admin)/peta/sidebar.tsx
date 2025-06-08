import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { DataPoint } from "./page"

type SidebarProps = {
  data: DataPoint[]
  onClose: () => void
}

export default function SidebarPeta({ data, onClose }: SidebarProps) {
  if (!data || data.length === 0) return null

  const { language } = useLanguage()
  const locationInfo = data[0].location

  // Pagination setup
  const pageSize = 3
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = currentPage * pageSize
  const currentData = data.slice(startIndex, startIndex + pageSize)

  return (
    <div className="absolute top-0 right-0 w-full md:w-[520px] h-full shadow-lg z-10 p-4 overflow-y-auto bg-white dark:border-gray-800 dark:bg-black">
      <button className="text-right mb-4 text-sm text-red-500" onClick={onClose}>
        {language === "en" ? "Close" : "Tutup"}
      </button>

      <h2 className="text-lg font-bold mb-2">{locationInfo.name}</h2>
      <p><strong>{language === "en" ? "Latitude" : "Lintang"}:</strong> {locationInfo.latitude}</p>
      <p><strong>{language === "en" ? "Longitude" : "Bujur"}:</strong> {locationInfo.longitude}</p>
      <p><strong>{language === "en" ? "Address" : "Alamat"}:</strong> {locationInfo.address}</p>

      <hr className="my-4" />
      <h3 className="font-semibold mb-2">{language === "en" ? "Classification History" : "Riwayat Klasifikasi"}</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2">{language === "en" ? "Contributor" : "Kontributor"}</th>
              <th className="p-2">{language === "en" ? "Timestamp" : "Waktu"}</th>
              <th className="p-2">{language === "en" ? "Parameters" : "Parameter"}</th>
              <th className="p-2">WQI</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((entry, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2">{entry.account.name}</td>
                <td className="p-2">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="p-2 space-y-1">
                  {Object.entries(entry.parameters).map(([key, obj]: [string, any]) => (
                    <p key={key}>
                      <strong>{key}:</strong>{" "}
                      <span className={obj.isImputed ? "text-orange-500" : ""}>
                        {String(obj.value)}
                      </span>
                      {obj.isImputed && (
                        <span className="text-xs text-gray-400 ml-1">(imputed)</span>
                      )}
                    </p>
                  ))}
                </td>
                <td className="p-2 space-y-1">
                  {Object.entries(entry.wqi).map(([key, obj]: [string, any]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {String(obj.value)}
                    </p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          {language === "en" ? "Previous" : "Sebelumnya"}
        </button>
        <span className="text-sm">
          {language === "en" ? "Page" : "Halaman"} {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          {language === "en" ? "Next" : "Berikutnya"}
        </button>
      </div>
    </div>
  )
}

type SidebarProps = {
    data: any[] // now an array of entries
    onClose: () => void
}

export default function SidebarPeta({ data, onClose }: SidebarProps) {
    if (!data || data.length === 0) return null

    console.log("Sidebar data:", data)

    const locationInfo = data[0].location

    return (
        <div className="absolute top-0 right-0 w-full md:w-[500px] h-full shadow-lg z-10 p-4 overflow-y-auto bg-white dark:border-gray-800 dark:bg-black">
        <button className="text-right mb-4 text-sm text-red-500" onClick={onClose}>
            Close
        </button>

        <h2 className="text-lg font-bold mb-2">{locationInfo.name}</h2>
        <p><strong>Latitude:</strong> {locationInfo.latitude}</p>
        <p><strong>Longitude:</strong> {locationInfo.longitude}</p>

        <hr className="my-4" />
        <h3 className="font-semibold mb-2">Riwayat Klasifikasi</h3>

        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                <th className="p-2">Contributor</th>
                <th className="p-2">Waktu</th>
                <th className="p-2">Parameters</th>
                <th className="p-2">WQI</th>
                </tr>
            </thead>
            <tbody>
                {data.map((entry, index) => (
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
                        <strong>{key}:</strong> {String(obj.value)}{" "}
                        <span className="text-sm text-gray-500">
                            ({(obj.confidence * 100).toFixed(1)}%)
                        </span>
                        </p>
                    ))}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
}

type SidebarProps = {
    data: any
    onClose: () => void
}

export default function SidebarPeta({ data, onClose }: SidebarProps) {
    return (
        <div className="absolute top-0 right-0 w-full md:w-[400px] h-full bg-white shadow-lg z-10 p-4 overflow-y-auto">
        <button className="text-right mb-4 text-sm text-red-500" onClick={onClose}>
            Close
        </button>
        <h2 className="text-lg font-bold mb-2">{data.location.name}</h2>
        <p><strong>Latitude:</strong> {data.location.latitude}</p>
        <p><strong>Longitude:</strong> {data.location.longitude}</p>
        <p><strong>Contributor:</strong> {data.account.name}</p>
        <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        <hr className="my-2" />

        <h3 className="font-semibold mt-2">Parameters</h3>
        {Object.entries(data.parameters).map(([key, obj]: [string, any]) => (
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

        <hr className="my-2" />
        <h3 className="font-semibold mt-2">WQI</h3>
        {Object.entries(data.wqi).map(([key, obj]: [string, any]) => (
            <p key={key}>
            <strong>{key}:</strong> {String(obj.value)}{" "}
            <span className="text-sm text-gray-500">
                (confidence: {(obj.confidence * 100).toFixed(1)}%)
            </span>
            </p>
        ))}
        </div>
    )
}

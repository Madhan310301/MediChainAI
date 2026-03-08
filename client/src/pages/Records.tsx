import { useState, useEffect } from "react";
import { FileText, Upload, Download, Trash2, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import { useLanguage } from "../hooks/use-language";

interface RecordItem {
  _id: string;
  title: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export default function Records() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("Prescription");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch records", err);
    }
  };

  const handleUpload = async () => {
    if (!file || !recordName) {
      alert("Please select a file and enter a record name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", recordName);
    formData.append("type", recordType);

    try {
      setLoading(true);
      setUploadStatus('idle');

      const res = await fetch("/api/records/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadStatus('success');
        setFile(null);
        setRecordName("");
        // Reset file input
        const fileInput = document.getElementById("record-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchRecords();
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        setUploadStatus('error');
      }
    } catch (err) {
      console.error("Upload failed", err);
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (record: RecordItem) => {
    try {
      const res = await fetch(`/api/records/${record._id}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. The file may not exist on the server.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medical record? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & search
  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const recordTypes = ["All", "Prescription", "Lab Report", "Scan / Imaging", "Discharge Summary", "Other"];

  return (
    <div className="pt-28 px-8 space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-primary bg-clip-text text-transparent">
          {t.healthRecords || "Health Records"}
        </h1>
        <p className="text-gray-500 mt-1">Securely upload, manage, and download your medical records</p>
      </div>

      {/* Upload Card */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-primary">
            <Upload size={20} />
          </div>
          <h2 className="text-lg font-semibold">
            {t.uploadRecord || "Upload Medical Record"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t.recordName || "Enter record title (e.g., Blood Test Jan 2026)"}
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            className="border border-gray-200 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="border border-gray-200 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          >
            <option>Prescription</option>
            <option>Lab Report</option>
            <option>Scan / Imaging</option>
            <option>Discharge Summary</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="record-file-input"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-gray-200 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />

          <button
            onClick={handleUpload}
            disabled={loading || !file || !recordName}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 font-medium flex items-center gap-2 justify-center min-w-[160px]"
          >
            <Upload size={18} />
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
            <CheckCircle size={18} />
            <span className="font-medium text-sm">Record uploaded and saved to database successfully!</span>
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
            <AlertCircle size={18} />
            <span className="font-medium text-sm">Upload failed. Please try again.</span>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {t.actions || "Medical Records"} 
            <span className="text-sm font-normal text-gray-400">({filteredRecords.length})</span>
          </h2>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl w-full sm:w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {recordTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 p-4 rounded-xl hover:bg-gray-50/80 hover:shadow-sm transition-all gap-3 ${
                  deletingId === record._id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-50 text-primary flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{record.title}</p>
                    <p className="text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                        {record.type}
                      </span>
                      {new Date(record.uploadedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(record)}
                    className="flex items-center gap-1.5 bg-blue-50 text-primary px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(record._id)}
                    disabled={deletingId === record._id}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              {searchTerm || filterType !== "All"
                ? "No records match your search criteria"
                : "No medical records uploaded yet"}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {searchTerm || filterType !== "All"
                ? "Try adjusting your search or filter"
                : "Upload your first record above to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
const API_URL = "https://localhost:7202/api/Object";

export async function getAllWkts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Veriler alınamadı.");
  
  const result = await response.json();

  // Eğer başarılı yanıt varsa ve result.success varsa sıralama yap
  if (result.success && Array.isArray(result.data)) {
    result.data.sort((a, b) => a.objectId - b.objectId);
  }

  return result;
}

export async function getWktById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Kayıt alınamadı.");
  return await response.json();
}

export async function addWkt(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Ekleme başarısız.");
  return await response.json();
}

export async function addRangeWkts(data) {
  const response = await fetch(`${API_URL}/addrange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Toplu ekleme başarısız.");
  return await response.json();
}

export async function updateWkt(data) {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Güncelleme başarısız.");
  return await response.json();
}

export async function deleteWkt(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Silme başarısız.");
  return await response.json();
}



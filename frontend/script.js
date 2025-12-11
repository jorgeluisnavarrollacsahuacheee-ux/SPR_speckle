const API_URL = "http://127.0.0.1:8000";

document.getElementById("sendBtn").addEventListener("click", async () => {

    const fileInput = document.getElementById("imageInput");
    const sampleName = document.getElementById("sampleName").value;
    const liquidLabel = document.getElementById("liquidLabel").value;

    if (!fileInput.files.length) {
        alert("Selecciona una imagen primero.");
        return;
    }

    // Leer operaciones seleccionadas
    const ops = {};
    document.querySelectorAll(".ops input").forEach(chk => {
        ops[chk.value] = chk.checked;
    });

    const formData = new FormData();
    formData.append("sample_name", sampleName);
    formData.append("liquid_label", liquidLabel);
    formData.append("operations_json", JSON.stringify(ops));
    formData.append("file", fileInput.files[0]);

    const res = await fetch(`${API_URL}/process_sample`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    document.getElementById("resultBox").textContent = JSON.stringify(data, null, 4);
});

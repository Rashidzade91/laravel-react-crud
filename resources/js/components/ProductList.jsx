import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    const [editingProductId, setEditingProductId] = useState(null); // Hansı məhsul redaktə olunur?
    const [isEditing, setIsEditing] = useState(false); // Hazırda redaktə rejimindəyikmi?
    const [searchTerm, setSearchTerm] = useState("");

    const [count, setCount] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 1) {
                // Axtarış funksiyasını çağırırıq
                performSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                // İnput boşdursa, bütün siyahını bərpa et
                fetchProducts();
            }
        }, 2000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

   const performSearch = async (query) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/search?query=${query}`);
        setProducts(response.data);
    } catch (error) {
        console.error("Axtarış xətası:", error);
    }
};

    const editProduct = (product) => {
        setIsEditing(true);
        setEditingProductId(product.id);
        setName(product.name);
        setDescription(product.description || "");
        // Diqqət: Qiyməti təmiz rəqəmə çevirməliyik, yoxsa "AZN" sözü inputu korlayacaq
        setPrice(parseFloat(product.price) || 0);
        setCount(product.count); // BU SƏTRİ ƏLAVƏ ET
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const response = await axios.get("/api/products");
        setProducts(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                description,
                price: parseFloat(price), // "12.50" bunu 12.5 kimi rəqəmə çevirir
                count: parseInt(count), // Məhsulun sayı kəsr ola bilməz (məsələn, 2.5 ədəd telefon olmur).
            }; // Sayını da göndəririk

            if (isEditing) {
                await axios.put(`/api/products/${editingProductId}`, payload);
                alert("Məhsul yeniləndi!");
            } else {
                await axios.post("/api/products", payload);
                alert("Məhsul əlavə edildi!");
            }

            // --- FORMALARI SIFIRLAYIRIQ ---
            setName("");
            setDescription("");
            setPrice("");
            setCount(0);
            setIsEditing(false);
            setEditingProductId(null);

            // --- SİYAHINI YENİLƏYİRİK ---
            // Bu funksiyanın daxilində setProducts(response.data) olduğuna əmin ol
            await fetchProducts();
        } catch (error) {
            console.error("Xəta detalı:", error.response?.data);
            alert("Xəta baş verdi! Konsola baxın.");
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Silmək istədiyinizə əminsiniz?")) {
            await axios.delete(`/api/products/${id}`);
            fetchProducts();
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Yeni Məhsul Əlavə Et</h2>
            <input
                type="text"
                placeholder="Məhsul axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-8"
            />
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Ad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <br />
                <textarea
                    placeholder="Təsvir"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <br />
                <input
                    type="number"
                    placeholder="Qiymət"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <br />
                <input
                    type="number"
                    placeholder="Sayı"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    required
                />
                <br />
                <button
                    type="submit"
                    style={{
                        backgroundColor: isEditing ? "orange" : "green",
                        color: "white",
                    }}
                >
                    {isEditing ? "Yenilə" : "Əlavə Et"}
                </button>
                {isEditing && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setName("");
                            setDescription("");
                            setPrice("");
                            setCount(0);
                        }}
                    >
                        Ləğv Et
                    </button>
                )}
            </form>

            <hr />

            <h2>Məhsul Siyahısı</h2>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Qiymət</th>
                        <th>Say</th>
                        <th>Təsvir</th>
                        <th>Status</th>
                        <th>Əməliyyatlar</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.price}</td>
                            <td>{p.count} ədəd</td>
                            <td>{p.description}</td>
                            <td
                                style={{
                                    color: p.count > 0 ? "green" : "red",
                                    fontWeight: "bold",
                                }}
                            >
                                {p.stock_status}
                            </td>
                            <td>
                                <button onClick={() => editProduct(p)}>
                                    Redaktə et
                                </button>
                                <button
                                    onClick={() => deleteProduct(p.id)}
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                    }}
                                >
                                    Sil
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;

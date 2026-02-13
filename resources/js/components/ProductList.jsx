import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    const [editingProductId, setEditingProductId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [count, setCount] = useState(0);

    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authName, setAuthName] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [authUser, setAuthUser] = useState(null);

    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [orderNote, setOrderNote] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingItems, setEditingItems] = useState([]);
    const [editingNote, setEditingNote] = useState("");

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            fetchMe();
            fetchOrders();
        } else {
            delete axios.defaults.headers.common.Authorization;
            setAuthUser(null);
            setOrders([]);
        }
    }, [token]);

    useEffect(() => {
        if (!authUser) return;
        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [authUser]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 1) {
                performSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                fetchProducts();
            }
        }, 700);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const performSearch = async (query) => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/products/search?query=${query}`
            );
            setProducts(response.data);
        } catch (error) {
            console.error("Axtaris xetasi:", error);
        }
    };

    const editProduct = (product) => {
        setIsEditing(true);
        setEditingProductId(product.id);
        setName(product.name);
        setDescription(product.description || "");
        setPrice(parseFloat(product.price) || 0);
        setCount(product.count);
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
                price: parseFloat(price),
                count: parseInt(count),
            };

            if (isEditing) {
                await axios.put(`/api/products/${editingProductId}`, payload);
                alert("Mehsul yenilendi!");
            } else {
                await axios.post("/api/products", payload);
                alert("Mehsul elave edildi!");
            }

            setName("");
            setDescription("");
            setPrice("");
            setCount(0);
            setIsEditing(false);
            setEditingProductId(null);
            await fetchProducts();
        } catch (error) {
            console.error("Xeta:", error.response?.data);
            alert("Xeta bas verdi! Konsola baxin.");
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Silmek isteyirsiniz?")) {
            await axios.delete(`/api/products/${id}`);
            fetchProducts();
        }
    };

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/auth/login", {
                email: authEmail,
                password: authPassword,
            });
            localStorage.setItem("token", response.data.token);
            setToken(response.data.token);
            setAuthUser(response.data.user);
            setAuthEmail("");
            setAuthPassword("");
        } catch (error) {
            console.error("Login xetasi:", error.response?.data);
            alert("Login xetasi. Email/parolu yoxlayin.");
        }
    };

    const register = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/auth/register", {
                name: authName,
                email: authEmail,
                password: authPassword,
                password_confirmation: authPassword,
            });
            localStorage.setItem("token", response.data.token);
            setToken(response.data.token);
            setAuthUser(response.data.user);
            setAuthName("");
            setAuthEmail("");
            setAuthPassword("");
            setIsRegistering(false);
        } catch (error) {
            console.error("Register xetasi:", error.response?.data);
            alert("Qeydiyyat xetasi. Email artiq ola biler.");
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout xetasi:", error.response?.data);
        } finally {
            localStorage.removeItem("token");
            setToken("");
            setAuthUser(null);
            setCart([]);
        }
    };

    const fetchMe = async () => {
        try {
            const response = await axios.get("/api/auth/me");
            setAuthUser(response.data);
        } catch (error) {
            console.error("Me xetasi:", error.response?.data);
            localStorage.removeItem("token");
            setToken("");
        }
    };

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const response = await axios.get("/api/orders");
            const data = response.data;
            if (authUser && !authUser.is_admin) {
                setOrders(data.filter((o) => o.status !== "canceled"));
            } else {
                setOrders(data);
            }
        } catch (error) {
            console.error("Orders xetasi:", error.response?.data);
        }
    };

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((p) => p.product_id === product.id);
            if (existing) {
                return prev;
            }
            if (product.count < 1) {
                alert("Stokda mehsul yoxdur.");
                return prev;
            }
            return [
                ...prev,
                { product_id: product.id, name: product.name, quantity: 1 },
            ];
        });
    };

    const updateCartQty = (productId, quantity) => {
        const product = products.find((p) => p.id === productId);
        const maxQty = product ? product.count : 1;
        const qty = Math.min(
            Math.max(1, parseInt(quantity || 1)),
            Math.max(1, maxQty)
        );
        setCart((prev) =>
            prev.map((p) =>
                p.product_id === productId ? { ...p, quantity: qty } : p
            )
        );
        if (product && qty >= maxQty) {
            alert("Stok limitine catdin.");
        }
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((p) => p.product_id !== productId));
    };

    const createOrder = async () => {
        if (!cart.length) {
            alert("Sifaris ucun mehsul secin.");
            return;
        }
        try {
            const payload = {
                items: cart.map((p) => ({
                    product_id: p.product_id,
                    quantity: p.quantity,
                })),
                note: orderNote || null,
            };
            await axios.post("/api/orders", payload);
            setCart([]);
            setOrderNote("");
            await fetchOrders();
            await fetchProducts();
            alert("Sifaris yaradildi.");
        } catch (error) {
            console.error("Sifaris xetasi:", error.response?.data);
            alert("Sifaris yaradilmadi. Konsola baxin.");
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status });
            await fetchOrders();
        } catch (error) {
            console.error("Status xetasi:", error.response?.data);
            alert("Status deyisile bilmedi.");
        }
    };

    const statusOptions = [
        "pending",
        "approved",
        "rejected",
        "shipped",
        "completed",
        "canceled",
    ];

    const statusLabels = {
        pending: "Gozlemede",
        approved: "Tesdiqlendi",
        rejected: "Reddedildi",
        shipped: "Gonderildi",
        canceled: "Legv edildi",
    };

    const statusColor = (status) => {
        switch (status) {
            case "approved":
                return "green";
            case "rejected":
                return "red";
            case "shipped":
                return "blue";
            case "completed":
                return "purple";
            default:
                return "orange";
        }
    };

    const startEditOrder = (order) => {
        setEditingOrder(order);
        setEditingItems(
            order.items.map((i) => ({
                product_id: i.product_id,
                name: i.product?.name,
                quantity: i.quantity,
            }))
        );
        setEditingNote(order.note || "");
        window.scrollTo(0, 0);
    };

    const updateEditQty = (productId, quantity) => {
        const qty = Math.max(0, parseInt(quantity || 0));
        setEditingItems((prev) =>
            prev.map((i) =>
                i.product_id === productId ? { ...i, quantity: qty } : i
            )
        );
    };

    const removeEditItem = (productId) => {
        setEditingItems((prev) => prev.filter((i) => i.product_id !== productId));
    };

    const saveEditOrder = async () => {
        const items = editingItems.filter((i) => i.quantity > 0);
        if (!items.length) {
            alert("Sifarisde hec olmasa 1 mehsul olmalidir.");
            return;
        }
        try {
            await axios.put(`/api/orders/${editingOrder.id}`, {
                items: items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                })),
                note: editingNote || null,
            });
            setEditingOrder(null);
            setEditingItems([]);
            setEditingNote("");
            await fetchOrders();
            await fetchProducts();
            alert("Sifaris yenilendi.");
        } catch (error) {
            console.error("Edit xetasi:", error.response?.data);
            alert("Sifaris yenilenmedi.");
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/cancel`);
            await fetchOrders();
            await fetchProducts();
        } catch (error) {
            console.error("Cancel xetasi:", error.response?.data);
            alert("Sifaris legv edilmedi.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Giris</h2>
            {authUser ? (
                <div style={{ marginBottom: "12px" }}>
                    <div>
                        Salam, <b>{authUser.name}</b>{" "}
                        {authUser.is_admin ? "(Admin)" : "(User)"}
                    </div>
                    <button onClick={logout}>Cixis</button>
                </div>
            ) : (
                <form
                    onSubmit={isRegistering ? register : login}
                    style={{ marginBottom: "20px" }}
                >
                    {isRegistering && (
                        <input
                            type="text"
                            placeholder="Ad"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Parol"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                    />
                    <button type="submit">
                        {isRegistering ? "Qeydiyyat" : "Login"}
                    </button>
                    <button
                        type="button"
                        style={{ marginLeft: "8px" }}
                        onClick={() => setIsRegistering((v) => !v)}
                    >
                        {isRegistering ? "Login-a qayit" : "Qeydiyyat et"}
                    </button>
                </form>
            )}

            {authUser && (
                <>
                    {editingOrder && (
                        <div style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
                            <h3>Sifarisi deyis</h3>
                            <table border="1" width="100%" style={{ marginBottom: "10px" }}>
                                <thead>
                                    <tr>
                                        <th>Mehsul</th>
                                        <th>Say</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editingItems.map((i) => (
                                        <tr key={i.product_id}>
                                            <td>{i.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={i.quantity}
                                                    onChange={(e) =>
                                                        updateEditQty(
                                                            i.product_id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        removeEditItem(i.product_id)
                                                    }
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <input
                                type="text"
                                placeholder="Qeyd (isteye gore)"
                                value={editingNote}
                                onChange={(e) => setEditingNote(e.target.value)}
                            />
                            <button onClick={saveEditOrder}>Yadda saxla</button>
                            <button
                                onClick={() => {
                                    setEditingOrder(null);
                                    setEditingItems([]);
                                    setEditingNote("");
                                }}
                                style={{ marginLeft: "8px" }}
                            >
                                Legv et
                            </button>
                        </div>
                    )}
                    <h2>Sifaris sebeti</h2>
                    {cart.length === 0 ? (
                        <div>Hele mehsul secilmeyib.</div>
                    ) : (
                        <table border="1" width="100%" style={{ marginBottom: "10px" }}>
                            <thead>
                                <tr>
                                    <th>Mehsul</th>
                                    <th>Say</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => (
                                    <tr key={item.product_id}>
                                        <td>{item.name}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateCartQty(
                                                        item.product_id,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.product_id)
                                                }
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <input
                        type="text"
                        placeholder="Qeyd (isteye gore)"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                    />
                    <button onClick={createOrder}>Sifaris yarad</button>

                    <hr />

                    <h2>Sifarisler</h2>
                    <button onClick={fetchOrders}>Yenile</button>
                    <table border="1" width="100%" style={{ marginTop: "10px" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Items</th>
                                <th>Emeliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td>{o.user?.name}</td>
                                    <td>
                                        {authUser?.is_admin ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "999px",
                                                        backgroundColor: statusColor(o.status),
                                                        display: "inline-block",
                                                    }}
                                                />
                                                <select
                                                    value={o.status}
                                                    onChange={(e) =>
                                                        updateOrderStatus(
                                                            o.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {statusOptions.map((s) => (
                                                <option key={s} value={s}>
                                                    {statusLabels[s] || s}
                                                </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                    <span
                                        style={{
                                            color: statusColor(o.status),
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {statusLabels[o.status] || o.status}
                                    </span>
                                        )}
                                    </td>
                                    <td>{o.total}</td>
                                    <td>
                                        {o.items?.map((i) => (
                                            <div key={i.id}>
                                                {i.product?.name} x {i.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {!authUser?.is_admin && o.status === "pending" && (
                                            <>
                                                <button onClick={() => startEditOrder(o)}>
                                                    Deyis
                                                </button>
                                                <button
                                                    onClick={() => cancelOrder(o.id)}
                                                    style={{ marginLeft: "6px" }}
                                                >
                                                    Legv et
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <hr />
                </>
            )}

            <h2>Yeni Mehsul Elave Et</h2>
            <input
                type="text"
                placeholder="Mehsul axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-8"
            />
            {authUser?.is_admin ? (
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
                        placeholder="Tesvir"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <br />
                    <input
                        type="number"
                        placeholder="Qiymet"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="number"
                        placeholder="Say"
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
                        {isEditing ? "Yenile" : "Elave Et"}
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
                            Legv Et
                        </button>
                    )}
                </form>
            ) : (
                <div style={{ marginBottom: "20px", color: "gray" }}>
                    Mehsul elave/yenileme yalniz admin ucundur.
                </div>
            )}

            <hr />

            <h2>Mehsul Siyahisi</h2>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Qiymet</th>
                        <th>Say</th>
                        <th>Tesvir</th>
                        <th>Status</th>
                        <th>Emeliyyatlar</th>
                    </tr>
                </thead>
                <tbody>
                    {products?.data?.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.price}</td>
                            <td>{p.count} eded</td>
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
                                {authUser?.is_admin && (
                                    <>
                                        <button onClick={() => editProduct(p)}>
                                            Redakte et
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
                                    </>
                                )}
                                {authUser && (
                                    <button
                                        onClick={() => addToCart(p)}
                                        disabled={p.count <= 0}
                                        style={{ marginLeft: "6px" }}
                                    >
                                        Sifarise elave et
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;

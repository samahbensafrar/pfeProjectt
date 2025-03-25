import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SearchBar from './components/searchBar';
import Tableemployees from "./tableemployees";

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({ username: "", phone_number: "", role: "", password: "" });
    const [password, setPassword] = useState({ newPassword: "", confirmPassword: "" });
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [passwordModal, setPasswordModal] = useState(false);
    const [error, setError] = useState("");

    
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/users/");
                setEmployees(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const toggleModal = () => setModal(!modal);
    const togglePasswordModal = () => setPasswordModal(!passwordModal);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword({ ...password, [name]: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/users/", formData, {
                headers: { "Content-Type": "application/json" },
            });
            setEmployees((prev) => [...prev, response.data]);
            setFormData({ username: "", phone_number: "", role: "", password: "" });
            toggleModal();
        } catch (error) {
            console.error("Error adding employee:", error.response?.data || error.message);
        }
    };

   
    const handleDelete = async (employeeId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/${employeeId}/`);
            setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId));
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

  
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (password.newPassword !== password.confirmPassword) {
            setError("Le nouveau mot de passe et la confirmation ne correspondent pas");
            return;
        }

        try {
            await axios.patch(`http://127.0.0.1:8000/api/users/${selectedEmployeeId}/`, {
                password: password.newPassword
            });

            setPassword({ newPassword: "", confirmPassword: "" });
            setError("");
            togglePasswordModal();
        } catch (error) {
            console.error("Error updating password:", error);
        }
    };

    const openPasswordModal = (employeeId) => {
        setSelectedEmployeeId(employeeId);
        togglePasswordModal();
    };


    const roleOptions = [
        { value: 2, label: "Responsable de Boufarik" },
        { value: 3, label: "Responsable de Mouzaia" },
        { value: 4, label: "Responsable de Larbaa" },
        { value: 5, label: "Responsable de Oulad Yaich" },
        { value: 6, label: "Responsable de El Wouroud" },
        { value: 7, label: "Responsable de Bougara" },
        { value: 8, label: "Responsable de Afroun" }
    ];

    const filteredData = employees
        .filter((employee) => employee.role !== "") 
        .filter((employee) =>
            (employee.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.role || "").toString().includes(searchTerm.toLowerCase())
        );

    return (
        <>
            <Navbar />
            <Sidebar />

            <div className="employee-container">
                <h1>Liste des Employés</h1>

                <div className="search-import">
                    <SearchBar className="search" onSearch={setSearchTerm} />
                    <button className="ajouter" onClick={toggleModal}>Ajouter employé</button>
                </div>

                <Tableemployees employees={filteredData} onPasswordChange={openPasswordModal} onDelete={handleDelete} />
            </div>

            {modal && (
                <div className="modal">
                    <div className='overlay' onClick={toggleModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Ajouter Employé</h3>
                            <form onSubmit={handleSubmit}>
                                <input type="text" name="username" placeholder="Nom d'utilisateur" value={formData.username} onChange={handleInputChange} required />
                                <input type="text" name="phone_number" placeholder="Numéro de téléphone" value={formData.phone_number} onChange={handleInputChange} required />
                                <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleInputChange} required />
                                <select name="role" value={formData.role} onChange={handleInputChange} required>
                                    <option value="">Sélectionner un rôle</option>
                                    {roleOptions.map((role) => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                <div className="modal-buttons">
                                    <button type="button" className="cancel" onClick={toggleModal}>Annuler</button>
                                    <button type="submit" className="add">Ajouter</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Employees;

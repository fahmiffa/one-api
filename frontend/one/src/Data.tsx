import React, { useEffect, useState } from 'react';
import Add from './Add';

interface Dataqey {
    name: String,
    key: String
}

interface DataItem {
    id: number;
    name: string;
    klass: String;
    event: String;
    qey: string;
    timer: string;
    status: number;
    type: String;
    qeys: Dataqey[];
}


const Data: React.FC = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [btnClose, buttonClose] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);

    useEffect(() => {
        fetchData();

    }, []);

    const fetchData = async () => {
        try {
            const token = 'mysecrettoken';
            const response = await fetch('http://localhost:3000/api/data',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const res = await response.json();
            const data: DataItem[] = res.data;
            setData(data);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddButtonClick = () => {
        setShowForm(true);
        buttonClose(true);
    };

    const handleCloseForm = () => {

        setShowForm(false);
        buttonClose(false);
        fetchData();
    };

    const deleteData = async (id: number) => {
        try {
            const token = 'mysecrettoken';
            const response = await fetch(`http://localhost:3000/api/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            fetchData();
            alert('Data deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        }
    };

    if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;
    if (error) return <div className="container mt-5"><div className="alert alert-danger">Error: {error}</div></div>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Data</h1>
            <button className="btn btn-primary btn-sm mb-4 me-3 rounded-pill" onClick={handleAddButtonClick}><i className='bi bi-plus'></i> Tambah</button>
            {btnClose ? (
                <button className="btn btn-danger btn-sm mb-4 rounded-pill" onClick={handleCloseForm}><i className='bi bi-x'></i> Cancel</button>
            ) : null}
            {showForm && <Add onClose={handleCloseForm} />}

            {!showForm ? (
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Tipe</th>
                                <th>Kelas</th>
                                <th>Partai</th>
                                <th>Timer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.type}</td>
                                    <td>{item.klass}</td>
                                    <td>{item.event}</td>
                                    <td>
                                        <strong>Dewan : </strong>{item.qey}<br />
                                        <strong>Timer : </strong>{item.timer}
                                        <ul className="list-unstyled">
                                            {item.qeys.map((qey, index) => (
                                                <li key={index}>
                                                    <strong>{qey.name} :</strong> {qey.key}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        {item.status === 1 ? (
                                            <span className="badge text-bg-primary">Open</span>
                                        ) : (
                                            <span className="badge text-bg-danger">Closed</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteData(item.id)}
                                        >
                                            <i className='bi bi-trash'></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default Data;

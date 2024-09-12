import React, { useState } from 'react';

const Add: React.FC<{ onClose: () => void }> = ({ onClose }) => {

    const [inputs, setInputs] = useState<{ id: number; value: string }[]>([{ id: Date.now(), value: '' }]);
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [klass, setKlass] = useState('');
    const [epent, setEvent] = useState('');
    const [blue, setBlue] = useState('');
    const [red, setRed] = useState('');
    const [count, setCount] = useState<number | ''>(0);
    const [jurus, setJurus] = useState<number | ''>(0);
    const [showMatch, setshowMatch] = useState<boolean>(false);


    const handleChangeInput = (id: number, value: string) => {
        setInputs(inputs.map(input => (input.id === id ? { ...input, value } : input)));
    };

    const handleAdd = () => {
        setInputs([...inputs, { id: Date.now(), value: '' }]);
    };

    const handleRemove = (id: number) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value } = e.target;
        setType(value);
        if (value === 'tanding') {
            setshowMatch(true);
        }
        else {
            setshowMatch(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        let payload, uri, peserta;

        e.preventDefault();

        if (showMatch) {
            payload = {
                name,
                type,
                klass,
                event: epent,
                count,
                biru: blue,
                merah: red,
            };

            uri = 'http://localhost:3000/api/contest-tanding';
        }
        else {

            peserta = inputs.map(item => item.value);

            payload = {
                name,
                type,
                klass,
                event: epent,
                count,
                jurus,
                peserta: peserta
            };

            uri = 'http://localhost:3000/api/contest-seni';
        }


        try {

            console.log(JSON.stringify(payload));
            const token = 'mysecrettoken';
            const response = await fetch(uri, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add item');
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className='row'>
                    <div className='col-6 mb-3'>
                        <div className="form-group">
                            <label htmlFor="type" className="form-label">Tipe</label>
                            <select
                                id="type"
                                name="type"
                                className="form-select"
                                value={type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Pilih TIpe</option>
                                <option value="regu">Regu</option>
                                <option value="solo">Solo Kreatif</option>
                                <option value="ganda">Ganda</option>
                                <option value="tunggal">Tunggal</option>
                                <option value="tanding">Tanding</option>
                            </select>
                        </div>
                    </div>
                    <div className='col-6 mb-3'>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Nama</label>
                            <input type="text" id="name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    </div>
                    {showMatch ? (
                        <>
                            <div className='col-6 mb-3'>
                                <label htmlFor="blue" className="form-label">Blue</label>
                                <input
                                    type="text"
                                    id="blue"
                                    name="blue"
                                    className="form-control"
                                    value={blue} onChange={(e) => setBlue(e.target.value)}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label htmlFor="red" className="form-label">Red</label>
                                <input
                                    type="text"
                                    id="red"
                                    name="red"
                                    className="form-control"
                                    value={red} onChange={(e) => setRed(e.target.value)} />
                            </div>
                        </>
                    ) :
                        (
                            <>
                                <div className='col-8 mb-3'>
                                    {inputs.map(input => (
                                        <div className="input-group mb-3" key={input.id}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={input.value}
                                                onChange={(e) => handleChangeInput(input.id, e.target.value)}
                                                placeholder="Peserta"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => handleRemove(input.id)}
                                            >
                                                <i className='bi bi-trash'></i>
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-primary mb-3 btn-sm" onClick={handleAdd}>
                                        <i className='bi bi-plus'></i> Peserta
                                    </button>
                                </div>
                            </>
                        )}
                    <div className='col-6 mb-3'>
                        <div className="form-group">
                            <label htmlFor="klass" className="form-label">Kelas</label>
                            <input type="text" id="klass" className="form-control" value={klass} onChange={(e) => setKlass(e.target.value)} required />
                        </div>
                    </div>
                    <div className='col-6 mb-3'>
                        <div className="form-group">
                            <label htmlFor="event" className="form-label">Event</label>
                            <input type="text" id="event" className="form-control" value={epent} onChange={(e) => setEvent(e.target.value)} required />
                        </div>
                    </div>
                    <div className='col-6 mb-3'>
                        <div className="form-group">
                            <label htmlFor="count" className="form-label">juri</label>
                            <input type="number" id="count" min={1} className="form-control" value={count} onChange={(e) => setCount(Number(e.target.value))} required />
                        </div>
                    </div>
                    {showMatch ? (
                        null
                    ) :
                        (
                            <>
                                <div className='col-6 mb-3'>
                                    <div className="form-group">
                                        <label htmlFor="jurus" className="form-label">jurus</label>
                                        <input type="number" id="jurus" min={1} className="form-control" value={jurus} onChange={(e) => setJurus(Number(e.target.value))} required />
                                    </div>
                                </div>
                            </>
                        )}
                </div>
                <button type="submit" className="btn btn-primary my-3 rounded-pill"><i className='bi bi-save'></i> Save</button>
            </form>
        </div>
    );
};

export default Add;

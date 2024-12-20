import React from 'react';

const Armt = ({ users }) => {
    if (!users || users.length === 0) {
        return <div>No users found for this trade.</div>;
    }

    return (
        <div>
            <h2>Users for Armt Trade</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Rank</th>
                        <th className="border border-gray-300 px-4 py-2">BD Number</th>
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="text-center">
                            <td className="border border-gray-300 px-4 py-2">{user.fullName}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.rank}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.BdNUmber}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Armt;

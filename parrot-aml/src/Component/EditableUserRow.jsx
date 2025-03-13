import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../StyleSheet/EditableUserRow.css';

const EditableUserRow = ({ data, onSave }) => {
  const [editData, setEditData] = useState(data);
  const [editing, setEditing] = useState(false);

  const handleChange = (key, value) => {
    setEditData({ ...editData, [key]: value });
  };

  const handleSave = () => {
    setEditing(false);
    onSave(editData); // Update the row (e.g. update Firestore)
  };

  return (
    <div className="editable-user-row">
      {editing ? (
        <>
          <input
            type="text"
            value={editData.user}
            onChange={(e) => handleChange('user', e.target.value)}
            className="edit-input"
          />
          <input
            type="text"
            value={editData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            className="edit-input"
          />
          <input
            type="text"
            value={editData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="edit-input"
          />
          <input
            type="text"
            value={editData.lastOnline}
            onChange={(e) => handleChange('lastOnline', e.target.value)}
            className="edit-input"
          />
          <button onClick={handleSave} className="save-button">Save</button>
        </>
      ) : (
        <>
          <div className="cell">{editData.user}</div>
          <div className="cell">{editData.occupation}</div>
          <div className="cell">{editData.status}</div>
          <div className="cell">{editData.lastOnline}</div>
          <button onClick={() => setEditing(true)} className="edit-button">Edit</button>
        </>
      )}
    </div>
  );
};

EditableUserRow.propTypes = {
  data: PropTypes.shape({
    user: PropTypes.string,
    occupation: PropTypes.string,
    status: PropTypes.string,
    lastOnline: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditableUserRow;

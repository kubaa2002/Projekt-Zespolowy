import React from 'react';

const DeletePostModal = ({ title, onConfirm, show, setShow }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Potwierdź usunięcie</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShow(false)}
              aria-label="Zamknij"
            ></button>
          </div>
          <div className="modal-body">
            <p>Czy na pewno chcesz usunąć post: <strong>{title}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShow(false)}
            >
              Anuluj
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onConfirm();
                setShow(false);
              }}
            >
              Usuń
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePostModal;
// parrot-aml/src/Component/DetailPanel.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import '../StyleSheet/Panel.css'; // Reuse the same CSS for consistency

const DetailPanel = ({ children, showToggle = true }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [width, setWidth] = useState(400);
    const isResizing = useRef(false);

    const handleResizeMouseDown = (e) => {
        e.preventDefault();
        isResizing.current = true;
        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (moveEvent) => {
            if (isResizing.current) {
                const newWidth = Math.max(200, Math.min(600, startWidth - (moveEvent.clientX - startX)));
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {showToggle && (
                <button
                    className="toggle-button"
                    onClick={togglePanel}
                    style={{
                        width: '50px',
                        height: '50px',
                        right: isOpen ? `${width}px` : '0px',
                    }}
                >
                    {isOpen ? '⫸' : '⫷'}
                </button>
            )}
            <div
                className="panel-container"
                style={{
                    width: isOpen ? `${width}px` : '0px',
                    right: isOpen ? '0' : '-5px',
                    overflow: isOpen ? 'visible' : 'hidden',
                }}
            >
                {isOpen && (
                    <>
                        <div className="resizer" onMouseDown={handleResizeMouseDown}></div>
                        {children}
                    </>
                )}
            </div>
        </>
    );
};

DetailPanel.propTypes = {
    children: PropTypes.node.isRequired,
    showToggle: PropTypes.bool,
};

export default DetailPanel;
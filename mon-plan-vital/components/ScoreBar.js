import React from 'react';

const ScoreBar = ({ alignmentScore }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 50) return 'yellow';
        return 'red';
    };

    return (
        <div className="score-bar">
            <div className="score-label">Taux d'alignement :</div>
            <div className="score-value" style={{ color: getScoreColor(alignmentScore) }}>
                {alignmentScore}%
            </div>
            <div className="score-indicator" style={{ width: `${alignmentScore}%`, backgroundColor: getScoreColor(alignmentScore) }} />
        </div>
    );
};

export default ScoreBar;
import React from "react";
import "../../styles/PoolDetail.css";

const PositionPanel = ({ positions }) => {
  return (
    <div className="position-panel card">
      <h2>Your Positions</h2>
      {positions.length === 0 ? (
        <p>No active positions</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pool</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>APY</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <tr key={i}>
                <td>{pos.pool}</td>
                <td>{pos.amount}</td>
                <td>{pos.duration} Days</td>
                <td>{pos.apy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PositionPanel;

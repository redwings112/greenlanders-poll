import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../../styles/PoolDetail.css";

const COLORS = ["#40E0D0", "#7FFFD4", "#20B2AA", "#66CDAA"];

const AllocationChart = ({ data }) => {
  return (
    <div className="allocation-chart card">
      <h2>Asset Allocation</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;

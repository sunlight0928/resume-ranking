import React from "react";

type Props = {
  title: string;
};

const BreadcrumbDashboard = (props: Props) => {
  return (
    <div className="mb-6 font-bold text-xl dark:text-white">
      <h1>{props.title}</h1>
    </div>
  );
};

export default BreadcrumbDashboard;

import React from "react";
import { SquareArrowOutUpRight } from "lucide-react";

const Tab = ({ tabs, activeTab, handleTabChange }) => {
  return (
    <div className="col-xl-12 aos-init aos-animate">
      <ul
        className="nav about__button__wrap dashboard__button__wrap"
        id="myTab"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <li className="nav-item" role="presentation" key={index}>
            <button
              className={`single__tab__link ${
                activeTab === tab.name ? "active" : ""
              }`}
              onClick={() => handleTabChange(tab.name)}
              disabled={tab.disabled}
              style={
                tab.disabled
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : undefined
              }
            >
              <span style={{ whiteSpace: "nowrap" }}>
                {tab.name}
                {/* external: tab opens a page in a new tab */}
                {tab.external && (
                  <SquareArrowOutUpRight
                    size={14}
                    style={{ display: "inline-block", marginLeft: 6, verticalAlign: "middle" }}
                  />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tab;

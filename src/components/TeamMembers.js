import React from "react";
import './TeamMembers.css'; // Optional: Import CSS for styling

const TeamMembers = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Diya Nandana",
      role: "Team Lead- Frontend ",
    },
    {
      id: 2,
      name: "Sankeerth P",
      role: "Developer- Backend",
    },
    {
      id: 3,
      name: "Praveen S",
      role: "Developer- Backend",
    },
    {
      id: 4,
      name: "Shabarimuthu R",
      role: "Developer-Database",
    },
  ];

  return (
    <div className="team-members">
      <h2>Meet Our Team</h2>
      <div className="members-list">
        {teamMembers.map(member => (
          <div key={member.id} className="member-card">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
      <div className="team-description">
        <p>
          We're a group of passionate individuals driven by creativity and innovation. 
          This project is not just a milestone for us but also an exciting step in our journey 
          as developers. We're thrilled to share that this is our project for our very first hackathon, 
          and we can't wait to see where this journey takes us!
        </p>
      </div>
    </div>
  );
};

export default TeamMembers;

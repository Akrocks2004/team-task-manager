import { useState } from 'react';
import axios from 'axios';

function Projects() {

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/projects`,
        formData
      );

      alert('Project Created');

    } catch (error) {

      alert('Error creating project');

    }

  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Create Project
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-lg"
      >

        <input
          type="text"
          name="title"
          placeholder="Project Title"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Project Description"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <input
          type="date"
          name="deadline"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded"
        >
          Create Project
        </button>

      </form>

    </div>
  );
}

export default Projects;
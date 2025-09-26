"use client";

import { useState } from "react";

interface Task {
  _id: string;
  title: string;
  description: string;
  user?: string;
}

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const getAISuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });

      const data: { suggestions?: string[] } = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      } else {
        setAiSuggestions(["No suggestions returned."]);
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setAiSuggestions(["Failed to fetch AI suggestions."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="font-bold">{task.title}</h3>
      <p>{task.description}</p>

      <button
        onClick={getAISuggestions}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get AI Suggestions"}
      </button>

      {aiSuggestions && (
        <ul className="mt-2 text-sm text-gray-700 italic list-disc list-inside">
          {aiSuggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

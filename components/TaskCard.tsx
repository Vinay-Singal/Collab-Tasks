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
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const getAISuggestion = async () => {
    try {
      const res = await fetch("/api/tasks/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });

      const data: { suggestions?: string[] } = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestion(data.suggestions[0]);
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setAiSuggestion("Failed to fetch AI suggestion.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="font-bold">{task.title}</h3>
      <p>{task.description}</p>

      <button
        onClick={getAISuggestion}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Get AI Suggestion
      </button>

      {aiSuggestion && (
        <p className="mt-2 text-sm text-gray-700 italic">{aiSuggestion}</p>
      )}
    </div>
  );
}

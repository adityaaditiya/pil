<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionController extends Controller
{
    public function index()
    {
        $questions = Question::when(request()->search, function ($query) {
            $query->where('question_text', 'like', '%' . request()->search . '%');
        })->latest()->paginate(10);

        return Inertia::render('Dashboard/Questionnaires/Questions/Index', [
            'questions' => $questions,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Questionnaires/Questions/Create');
    }

    public function store(Request $request)
    {
        $validated = $this->validateQuestion($request);

        Question::create($validated);

        return to_route('questions.index');
    }

    public function edit(Question $question)
    {
        return Inertia::render('Dashboard/Questionnaires/Questions/Edit', [
            'question' => $question,
        ]);
    }

    public function update(Request $request, Question $question)
    {
        $validated = $this->validateQuestion($request);

        $question->update($validated);

        return to_route('questions.index');
    }

    public function destroy(Question $question)
    {
        $question->delete();

        return back();
    }

    private function validateQuestion(Request $request): array
    {
        $validated = $request->validate([
            'question_text' => 'required|string|max:1000',
            'input_type' => 'required|in:text,multiple_choice,checkbox',
            'is_required' => 'nullable|boolean',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:255',
        ]);

        if (in_array($validated['input_type'], ['multiple_choice', 'checkbox'], true)) {
            $request->validate([
                'options' => 'required|array|min:2',
            ]);
        }

        $validated['is_required'] = (bool) ($validated['is_required'] ?? false);
        $validated['options'] = in_array($validated['input_type'], ['multiple_choice', 'checkbox'], true)
            ? array_values(array_filter($validated['options'] ?? [], fn ($option) => $option !== null && trim($option) !== ''))
            : null;

        return $validated;
    }
}

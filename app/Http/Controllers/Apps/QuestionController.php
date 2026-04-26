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
    // 1. Bersihkan data options dari nilai null atau string kosong sebelum validasi
    if ($request->has('options') && is_array($request->options)) {
        $filteredOptions = array_values(array_filter($request->options, function ($value) {
            return !is_null($value) && trim($value) !== '';
        }));
        $request->merge(['options' => $filteredOptions]);
    }

    // 2. Validasi Dasar
    $validated = $request->validate([
        'question_text' => 'required|string|max:1000',
        'input_type'    => 'required|in:text,multiple_choice,checkbox',
        'is_required'   => 'nullable|boolean',
        'options'       => 'nullable|array',
    ]);

    // 3. Validasi Khusus untuk Pilihan Ganda / Checkbox
    if (in_array($validated['input_type'], ['multiple_choice', 'checkbox'])) {
        $request->validate([
            'options'   => 'required|array|min:2', // Minimal 2 pilihan agar logis
            'options.*' => 'required|string|max:255',
        ], [
            'options.min' => 'Berikan minimal 2 pilihan jawaban.',
            'options.*.required' => 'Pilihan jawaban tidak boleh kosong.',
        ]);
        
        $validated['options'] = $request->options;
    } else {
        // Jika tipenya 'text', paksa options jadi null
        $validated['options'] = null;
    }

    $validated['is_required'] = (bool) ($validated['is_required'] ?? false);

    return $validated;
}
}

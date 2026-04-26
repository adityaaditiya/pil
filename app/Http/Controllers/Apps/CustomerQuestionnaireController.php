<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerQuestionnaireController extends Controller
{
    public function edit(Customer $customer)
    {
        $questions = Question::oldest('id')->get();
        $existingAnswers = $customer->questionnaireAnswers()
            ->pluck('answer_value', 'question_id')
            ->toArray();

        $questionsWithAnswers = $questions->map(function ($question) use ($existingAnswers) {
            $answer = $existingAnswers[$question->id] ?? null;

            if ($question->input_type === 'checkbox' && $answer) {
                $decoded = json_decode($answer, true);
                $answer = is_array($decoded) ? $decoded : [];
            }

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'input_type' => $question->input_type,
                'is_required' => $question->is_required,
                'options' => $question->options ?? [],
                'answer' => $answer,
            ];
        });

        return Inertia::render('Dashboard/Customers/Questionnaire', [
            'customer' => $customer,
            'questions' => $questionsWithAnswers,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $questions = Question::oldest('id')->get();
        $rules = [];

        foreach ($questions as $question) {
            $field = 'answers.' . $question->id;

            if ($question->input_type === 'text') {
                $rules[$field] = $question->is_required ? 'required|string' : 'nullable|string';
                continue;
            }

            if ($question->input_type === 'multiple_choice') {
                $allowed = implode(',', $question->options ?? []);
                $rules[$field] = ($question->is_required ? 'required' : 'nullable') . '|string|in:' . $allowed;
                continue;
            }

            if ($question->input_type === 'checkbox') {
                $rules[$field] = ($question->is_required ? 'required' : 'nullable') . '|array';
                $rules[$field . '.*'] = 'in:' . implode(',', $question->options ?? []);
            }
        }

        $validated = $request->validate($rules);
        $answers = $validated['answers'] ?? [];

        foreach ($questions as $question) {
            $value = $answers[$question->id] ?? null;

            if ($question->input_type === 'checkbox') {
                $value = $value ? json_encode(array_values($value)) : null;
            }

            CustomerAnswer::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'question_id' => $question->id,
                ],
                [
                    'answer_value' => is_string($value) || $value === null ? $value : (string) $value,
                ]
            );
        }

        return to_route('customers.index');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\CustomerAnswer;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserFormController extends Controller
{
    public function index(Request $request): Response
    {
        $customer = $request->user()?->customer;

        abort_unless($customer, 404);

        $questions = Question::query()->oldest('id')->get();
        $existingAnswers = $customer->questionnaireAnswers()
            ->pluck('answer_value', 'question_id')
            ->toArray();

        $questionsWithAnswers = $questions->map(function (Question $question) use ($existingAnswers) {
            $answer = $existingAnswers[$question->id] ?? null;

            if ($question->input_type === 'checkbox' && $answer) {
                $decoded = json_decode($answer, true);
                $answer = is_array($decoded) ? $decoded : [];
            }

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'input_type' => $question->input_type,
                'is_required' => (bool) $question->is_required,
                'options' => $question->options ?? [],
                'answer' => $answer,
            ];
        })->values();

        return Inertia::render('User/MyForm', [
            'questions' => $questionsWithAnswers,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $customer = $request->user()?->customer;

        abort_unless($customer, 404);

        $questions = Question::query()->oldest('id')->get();
        $rules = [];

        foreach ($questions as $question) {
            $field = 'answers.'.$question->id;

            if ($question->input_type === 'text') {
                $rules[$field] = $question->is_required ? 'required|string' : 'nullable|string';
                continue;
            }

            if ($question->input_type === 'multiple_choice') {
                $options = array_filter($question->options ?? [], fn ($option) => is_string($option) && $option !== '');

                $rules[$field] = ($question->is_required ? 'required' : 'nullable').'|string';

                if (count($options) > 0) {
                    $rules[$field] .= '|in:'.implode(',', $options);
                }
                continue;
            }

            if ($question->input_type === 'checkbox') {
                $rules[$field] = ($question->is_required ? 'required' : 'nullable').'|array';

                $options = array_filter($question->options ?? [], fn ($option) => is_string($option) && $option !== '');

                if (count($options) > 0) {
                    $rules[$field.'.*'] = 'in:'.implode(',', $options);
                }
            }
        }

        $validated = $request->validate($rules);
        $answers = $validated['answers'] ?? [];

        foreach ($questions as $question) {
            $value = $answers[$question->id] ?? null;

            if ($question->input_type === 'checkbox') {
                $value = is_array($value) && count($value) > 0 ? json_encode(array_values($value)) : null;
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

        return to_route('user.my-form')->with('success', 'Form kuesioner berhasil disimpan.');
    }
}

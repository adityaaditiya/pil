<?php

namespace App\Http\Controllers;

use App\Models\PilatesTimetable;
use Inertia\Inertia;
use Inertia\Response;

class PilatesTimetableController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Timetable/Index', [
            'timetables' => PilatesTimetable::with(['pilatesClass:id,name', 'trainer:id,name'])
                ->orderBy('start_at')
                ->paginate(10),
        ]);
    }
}

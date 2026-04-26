<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBooking;
use App\Models\PilatesBooking;
use App\Models\Trainer;
use App\Support\SimplePdfExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class TrainerReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->buildFilters($request);
        $rows = $this->buildRows($filters);

        return Inertia::render('Dashboard/Reports/TrainerReport', [
            'filters' => $filters,
            'rows' => $this->paginateRows($rows, $request),
            'summary' => $this->buildSummary($rows),
            'trainerOptions' => $this->buildTrainerOptions(),
            'classTypeOptions' => [
                ['value' => '', 'label' => 'Semua Jenis Kelas'],
                ['value' => 'appointment', 'label' => 'Appointment'],
                ['value' => 'booking_schedule', 'label' => 'Booking Schedule (Fixed Timetable)'],
            ],
        ]);
    }

    public function export(Request $request)
    {
        $filters = $this->buildFilters($request);
        $rows = $this->buildRows($filters);

        $headers = ['No', 'Tanggal', 'Jenis Kelas', 'Nama Kelas', 'Trainer', 'Peserta', 'Kehadiran', 'Durasi (Jam)', 'Okupansi'];
        $excelRows = $rows->values()->map(fn ($row, $index) => [
            $index + 1,
            $row['date'] ?? '-',
            $row['class_type_label'] ?? '-',
            $row['class_name'] ?? '-',
            $row['trainer_name'] ?? '-',
            (int) ($row['participants'] ?? 0),
            (int) ($row['attendance_count'] ?? 0),
            number_format((float) ($row['duration_hours'] ?? 0), 2),
            number_format((float) ($row['occupancy_rate'] ?? 0), 1) . '%',
        ])->all();

        return $this->downloadExcel('laporan-trainer.xls', $headers, $excelRows);
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->buildFilters($request);
        $rows = $this->buildRows($filters);

        $headers = ['No', 'Tanggal', 'Jenis Kelas', 'Nama Kelas', 'Trainer', 'Peserta', 'Kehadiran', 'Durasi (Jam)', 'Okupansi'];
        $pdfRows = $rows->values()->map(fn ($row, $index) => [
            $index + 1,
            $row['date'] ?? '-',
            $row['class_type_label'] ?? '-',
            $row['class_name'] ?? '-',
            $row['trainer_name'] ?? '-',
            (int) ($row['participants'] ?? 0),
            (int) ($row['attendance_count'] ?? 0),
            number_format((float) ($row['duration_hours'] ?? 0), 2),
            number_format((float) ($row['occupancy_rate'] ?? 0), 1) . '%',
        ])->all();

        return $this->downloadPdf(
            'laporan-trainer.pdf',
            'Laporan Trainer',
            $this->buildPeriodLabel($filters),
            $headers,
            $pdfRows
        );
    }

    private function buildFilters(Request $request): array
    {
        $defaultDate = Carbon::today()->toDateString();

        return [
            'start_date' => $request->input('start_date') ?: $defaultDate,
            'end_date' => $request->input('end_date') ?: $defaultDate,
            'class_type' => trim((string) $request->input('class_type')),
            'trainer_id' => $request->input('trainer_id'),
            'search' => trim((string) $request->input('search')),
        ];
    }

    private function buildRows(array $filters): Collection
    {
        $scheduleRows = PilatesBooking::query()
            ->where('status', 'confirmed')
            ->with(['user:id,name', 'timetable:id,pilates_class_id,trainer_id,start_at,duration_minutes,capacity', 'timetable.pilatesClass:id,name', 'timetable.trainer:id'])
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->get()
            ->map(function (PilatesBooking $booking) {
                $participants = (int) ($booking->participants ?? 0);
                $attendanceCount = $booking->attendance_status === 'present' ? $participants : 0;
                $capacity = (int) ($booking->timetable?->capacity ?? 0);

                return [
                    'id' => 'booking-' . $booking->id,
                    'sort_date' => $booking->booked_at?->toDateTimeString(),
                    'date' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                    'class_type' => 'booking_schedule',
                    'class_type_label' => 'Booking Schedule (Fixed Timetable)',
                    'class_name' => $booking->timetable?->pilatesClass?->name ?? '-',
                    'trainer_name' => $booking->timetable?->trainer?->name ?? '-',
                    'customer_name' => $booking->user?->name ?? '-',
                    'invoice' => $booking->invoice ?? '-',
                    'participants' => $participants,
                    'attendance_count' => $attendanceCount,
                    'capacity' => $capacity,
                    'duration_minutes' => (int) ($booking->timetable?->duration_minutes ?? 0),
                    'duration_hours' => round(((int) ($booking->timetable?->duration_minutes ?? 0)) / 60, 2),
                    'occupancy_rate' => $capacity > 0 ? round(($participants / $capacity) * 100, 1) : 0,
                ];
            });

        $appointmentRows = AppointmentBooking::query()
            ->where('status', 'confirmed')
            ->with(['customer:id,name', 'appointment:id,pilates_class_id,trainer_id,session_name,duration_minutes,start_at', 'appointment.pilatesClass:id,name', 'trainer:id', 'appointment.trainer:id'])
            ->when($filters['start_date'] ?? null, fn ($q, $start) => $q->whereDate('booked_at', '>=', $start))
            ->when($filters['end_date'] ?? null, fn ($q, $end) => $q->whereDate('booked_at', '<=', $end))
            ->get()
            ->map(function (AppointmentBooking $booking) {
                $trainer = $booking->trainer ?? $booking->appointment?->trainer;

                return [
                    'id' => 'appointment-' . $booking->id,
                    'sort_date' => $booking->booked_at?->toDateTimeString(),
                    'date' => $booking->booked_at?->timezone('Asia/Jakarta')->format('d M Y, H:i') ?? '-',
                    'class_type' => 'appointment',
                    'class_type_label' => 'Appointment',
                    'class_name' => $booking->appointment?->pilatesClass?->name ?? ($booking->session_name ?: ($booking->appointment?->session_name ?? '-')),
                    'trainer_name' => $trainer?->name ?? '-',
                    'customer_name' => $booking->customer?->name ?? '-',
                    'invoice' => $booking->invoice ?? '-',
                    'participants' => 1,
                    'attendance_count' => $booking->attendance_status === 'present' ? 1 : 0,
                    'capacity' => 1,
                    'duration_minutes' => (int) ($booking->appointment?->duration_minutes ?? 0),
                    'duration_hours' => round(((int) ($booking->appointment?->duration_minutes ?? 0)) / 60, 2),
                    'occupancy_rate' => 100,
                ];
            });

        return $scheduleRows
            ->merge($appointmentRows)
            ->when($filters['class_type'] ?? null, fn ($rows, $type) => $rows->where('class_type', $type))
            ->when($filters['trainer_id'] ?? null, function ($rows, $trainerId) {
                $trainerName = Trainer::query()->find($trainerId)?->name;

                if (! $trainerName) {
                    return $rows->take(0);
                }

                return $rows->filter(fn ($row) => strcasecmp((string) ($row['trainer_name'] ?? ''), (string) $trainerName) === 0);
            })
            ->when($filters['search'] ?? null, function ($rows, $search) {
                $term = mb_strtolower($search);

                return $rows->filter(function ($row) use ($term) {
                    $haystacks = [
                        $row['invoice'] ?? '',
                        $row['customer_name'] ?? '',
                        $row['trainer_name'] ?? '',
                        $row['class_name'] ?? '',
                        $row['class_type_label'] ?? '',
                        $row['date'] ?? '',
                    ];

                    foreach ($haystacks as $haystack) {
                        if (mb_stripos((string) $haystack, $term) !== false) {
                            return true;
                        }
                    }

                    return false;
                });
            })
            ->sortByDesc('sort_date')
            ->values();
    }

    private function paginateRows(Collection $rows, Request $request): LengthAwarePaginator
    {
        $perPage = 10;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $items = $rows->slice(($currentPage - 1) * $perPage, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $rows->count(),
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );
    }

    private function buildSummary(Collection $rows): array
    {
        $totalMinutes = (int) $rows->sum('duration_minutes');
        $participants = (int) $rows->sum('participants');
        $attendance = (int) $rows->sum('attendance_count');

        return [
            'total_hours' => round($totalMinutes / 60, 2),
            'total_participants' => $participants,
            'attendance_occupancy' => $participants > 0 ? round(($attendance / $participants) * 100, 1) : 0,
            'attendance_count' => $attendance,
        ];
    }

    private function buildTrainerOptions()
    {
        return Trainer::query()
            ->forTrainerRole()
            ->get(['id'])
            ->map(fn (Trainer $trainer) => [
                'id' => $trainer->id,
                'name' => $trainer->name ?? '-',
            ])
            ->sortBy('name')
            ->values();
    }

    private function buildPeriodLabel(array $filters): string
    {
        $startDate = $filters['start_date'] ?? '-';
        $endDate = $filters['end_date'] ?? '-';

        return 'PERIODE : ' . $startDate . ' s/d ' . $endDate;
    }

    private function downloadExcel(string $filename, array $headers, array $rows)
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            echo '<table border="1"><thead><tr>';
            foreach ($headers as $header) {
                echo '<th>' . e($header) . '</th>';
            }
            echo '</tr></thead><tbody>';
            foreach ($rows as $row) {
                echo '<tr>';
                foreach ($row as $cell) {
                    echo '<td>' . e((string) $cell) . '</td>';
                }
                echo '</tr>';
            }
            echo '</tbody></table>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    private function downloadPdf(string $filename, string $title, string $period, array $headers, array $rows)
    {
        $pdfBinary = SimplePdfExport::make($title, $period, $headers, $rows);

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}

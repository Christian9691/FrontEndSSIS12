<?php

use Illuminate\Support\Facades\Route;

// Serves the React app for every URL. No backend logic yet.
Route::get('/{any?}', fn () => view('app'))->where('any', '.*');
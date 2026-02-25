<?php
/**
 * contact.php — Portfolio Contact Form Handler
 * Sonal Kamble · Kamble Tech and Co.
 *
 * How to deploy:
 *   1. Upload this file alongside index.html to any PHP-capable host
 *      (e.g. cPanel shared hosting, InfinityFree,000webhost, BlueHost, etc.)
 *   2. Update TO_EMAIL below to your real email address.
 *   3. The form POSTs here; on success/failure it redirects back with a ?status= param
 *      OR returns a JSON response if the request is an AJAX fetch (JS handles it).
 */

/* ─── CONFIGURATION ─── */
define('TO_EMAIL', 'sonalkamble209@gmail.com'); // ← your inbox
define('TO_NAME', 'Sonal Kamble');
define('FROM_EMAIL', 'noreply@yourdomain.com'); // ← sender shown in email client
define('SITE_URL', 'index.html'); // ← redirect target after submit

/* ─── SECURITY HELPERS ─── */
function clean(string $val): string
{
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function is_ajax(): bool
{
    return isset($_SERVER['HTTP_X_REQUESTED_WITH'])
        && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

function respond(bool $ok, string $msg): void
{
    if (is_ajax()) {
        header('Content-Type: application/json');
        echo json_encode(['success' => $ok, 'message' => $msg]);
        exit;
    }
    $status = $ok ? 'success' : 'error';
    header('Location: ' . SITE_URL . '?status=' . $status . '#contact');
    exit;
}

/* ─── ONLY HANDLE POST ─── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . SITE_URL);
    exit;
}

/* ─── RATE LIMITING (session-based, simple) ─── */
session_start();
$now = time();
if (isset($_SESSION['last_contact_time']) && ($now - $_SESSION['last_contact_time']) < 60) {
    respond(false, 'Please wait a moment before sending another message.');
}

/* ─── READ & VALIDATE FIELDS ─── */
$errors = [];

$name = clean($_POST['name'] ?? '');
$company = clean($_POST['company'] ?? '');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');

if (empty($name))
    $errors[] = 'Name is required.';
if (!$email)
    $errors[] = 'A valid email address is required.';
if (empty($subject))
    $errors[] = 'Please select a subject.';
if (empty($message))
    $errors[] = 'Message cannot be empty.';
if (strlen($message) > 5000)
    $errors[] = 'Message is too long (max 5000 characters).';

// Basic spam honeypot check — add a hidden field named `website` in the form; bots fill it
if (!empty($_POST['website'])) {
    // Silent discard — don't tell bots they failed
    respond(true, 'Thank you! Your message was sent.');
}

if (!empty($errors)) {
    respond(false, implode(' ', $errors));
}

/* ─── BUILD EMAIL ─── */
$subject_map = [
    'job' => 'Job / Internship Opportunity',
    'collaboration' => 'Collaboration or Project',
    'question' => 'General Question',
    'other' => 'Other',
];
$subject_label = $subject_map[$subject] ?? ucfirst($subject);

$company_line = $company ? "Company:  {$company}\n" : '';

$body = <<<TEXT
You have a new portfolio contact form submission.

═══════════════════════════════════════
  FROM YOUR PORTFOLIO — sonalkamble.dev
═══════════════════════════════════════

Name:     {$name}
{$company_line}Email:    {$email}
Subject:  {$subject_label}

Message:
─────────────────────────────────────
{$message}
─────────────────────────────────────

Sent at: {$now} UTC
IP: {$_SERVER['REMOTE_ADDR']}TEXT;

/* ─── HEADERS ─── */
$headers = "From: {$name} <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$mail_subject = "[Portfolio] {$subject_label} — from {$name}";

/* ─── SEND ─── */
$sent = mail(TO_EMAIL, $mail_subject, $body, $headers);

if ($sent) {
    $_SESSION['last_contact_time'] = $now;
    respond(true, 'Message sent! I\'ll get back to you soon.');
}
else {
    error_log("Portfolio contact form mail() failed. To: " . TO_EMAIL . " From: {$email}");
    respond(false, 'Mail could not be sent. Please email me directly at ' . TO_EMAIL);
}
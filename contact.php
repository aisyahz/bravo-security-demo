<?php
declare(strict_types=1);
define('BRAVO_CONTACT', true);
require __DIR__ . '/includes/contact-security.php';

$secureCookie = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $secureCookie,
    'samesite' => 'Lax',
]);
session_start();

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');

$services = [
    'Static Security Guard',
    'Armed Guard',
    'K9 Guard Dog',
    'Mobile Patrols',
    'Security and Safety Equipment',
    'Bodyguard / Close Protection',
    'Mobile Escort Services',
    'Tracking and Monitoring Systems',
    'Closed-Circuit Television (CCTV) Monitoring',
    'Security Risk Assessment',
    'Event Security Management',
    'Cash in Transit',
];

if (!isset($_SESSION['contact_csrf'])) {
    $_SESSION['contact_csrf'] = bin2hex(random_bytes(32));
}

$escape = static function (string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
};

$values = [
    'customer_name' => '',
    'phone' => '',
    'email' => '',
    'service' => '',
    'message' => '',
];
$errors = [];
$sent = $_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_SESSION['contact_sent']);
unset($_SESSION['contact_sent']);
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['service']) && is_string($_GET['service']) && in_array($_GET['service'], $services, true)) {
    $values['service'] = $_GET['service'];
}
$httpStatus = 200;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($values as $key => $_) {
        $posted = $_POST[$key] ?? '';
        $values[$key] = is_string($posted) ? trim($posted) : '';
    }

    try {
        if (!bravoThrottle('post', 10, 900)) {
            $errors[] = 'Too many attempts. Please try again later or contact us by WhatsApp.';
            $httpStatus = 429;
            header('Retry-After: 900');
        }
    } catch (Throwable $exception) {
        error_log('Bravo enquiry throttle unavailable; submission blocked.');
        $errors[] = 'Enquiries are temporarily unavailable. Please contact us by email or WhatsApp.';
        $httpStatus = 503;
    }
    $csrf = $_POST['csrf_token'] ?? '';
    if (!is_string($csrf) || !hash_equals($_SESSION['contact_csrf'], $csrf)) {
        $errors[] = 'Your form session expired. Please reload the page and try again.';
        $httpStatus = 400;
    }

    if (!empty($_POST['website'])) {
        $errors[] = 'We could not process this enquiry. Please reload the page and try again.';
        $httpStatus = 400;
    }

    if (isset($_SESSION['last_contact_submission']) && time() - (int) $_SESSION['last_contact_submission'] < 60) {
        $errors[] = 'Please wait a minute before sending another enquiry.';
        $httpStatus = 429;
    }

    if ($values['customer_name'] === '' || strlen($values['customer_name']) > 120) {
        $errors[] = 'Enter your company or customer name (up to 120 characters).';
    }
    if (!bravoValidPhone($values['phone'])) {
        $errors[] = 'Enter a valid phone number.';
    }
    if (strlen($values['email']) > 254 || !filter_var($values['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Enter a valid email address.';
    }
    if (!in_array($values['service'], $services, true)) {
        $errors[] = 'Select a service from the list.';
    }
    if (strlen($values['message']) > 5000) {
        $errors[] = 'Keep your message to 5,000 characters or fewer.';
    }

    if ($errors === []) {
        try {
            if (!bravoThrottle('mail', 5, 3600)) {
                $errors[] = 'The enquiry limit has been reached. Please try again later or use WhatsApp.';
                $httpStatus = 429;
                header('Retry-After: 3600');
            }
        } catch (Throwable $exception) {
            error_log('Bravo enquiry throttle unavailable; submission blocked.');
            $errors[] = 'Enquiries are temporarily unavailable. Please use email or WhatsApp.';
            $httpStatus = 503;
        }
    }
    if ($errors === []) {
        $recipient = 'general.bravonetwork@gmail.com';
        $sender = 'website@bravosecuritynetwork.com.my';
        $subject = 'Website enquiry - ' . $values['service'];
        $body = implode("\r\n", [
            'New enquiry from the Bravo Security Network website',
            '',
            'Company / Customer Name: ' . $values['customer_name'],
            'Phone Number: ' . $values['phone'],
            'Email Address: ' . $values['email'],
            'Service Required: ' . $values['service'],
            '',
            'Message / Requirements:',
            $values['message'] !== '' ? $values['message'] : '(Not provided)',
        ]);
        $headers = implode("\r\n", [
            'From: Bravo Security Website <' . $sender . '>',
            'Reply-To: ' . $values['email'],
            'Content-Type: text/plain; charset=UTF-8',
        ]);

        if (@mail($recipient, $subject, $body, $headers)) {
            $_SESSION['contact_sent'] = true;
            $_SESSION['last_contact_submission'] = time();
            $_SESSION['contact_csrf'] = bin2hex(random_bytes(32));
            header('Location: contact.php#enquiry', true, 303);
            exit;
        }

        error_log('Bravo website enquiry could not be handed to the configured mail transport.');
        $errors[] = 'We could not send your enquiry right now. Please contact us by email or WhatsApp.';
        $httpStatus = 503;
    }

    http_response_code($httpStatus === 200 && $errors !== [] ? 422 : $httpStatus);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact Us | Bravo Security Network Sdn. Bhd.</title>
  <meta name="description" content="Contact Bravo Security Network for security service enquiries and quotations. WhatsApp or send a message." />
  <meta name="theme-color" content="#0b0b0b" />
  <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/style.css" />
<meta property="og:type" content="website" />
  <meta property="og:title" content="Contact Us | Bravo Security Network Sdn. Bhd." />
  <meta property="og:description" content="Contact Bravo Security Network for security service enquiries and quotations. WhatsApp or send a message." />
  <meta property="og:url" content="https://bravosecuritynetwork.com.my/contact.php" />
  <meta property="og:image" content="https://bravosecuritynetwork.com.my/assets/images/social-preview.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" />
  <link rel="canonical" href="https://bravosecuritynetwork.com.my/contact.php" />
  </head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header" id="siteHeader">
    <div class="container header__top">
      <a href="index.html" class="brand" aria-label="Bravo Security home"><img width="104" height="104" src="assets/img/bravo-logo-104.png" alt="" class="brand__logo" /><span class="brand__text"><span class="brand__name">BRAVO SECURITY</span><span class="brand__sub">NETWORK SDN. BHD.</span></span></a>
      <div class="header__contact"><a class="btn btn--primary header__whatsapp" href="https://wa.me/60172441959" target="_blank" rel="noopener noreferrer"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#message-circle"></use></svg>WhatsApp</a></div>
      <button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navMenu"><span></span><span></span><span></span></button>
    </div>
    <div class="header__nav"><nav class="container nav__menu" id="navMenu" aria-label="Primary"><ul><li><a href="index.html" class="nav__link">Home</a></li><li><a href="about.html" class="nav__link">About Us</a></li><li><a href="services.html" class="nav__link">Services</a></li><li><a href="contact.php" class="nav__link" aria-current="page">Contact</a></li></ul><a href="#enquiry" class="btn btn--primary nav__cta"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#file-text"></use></svg>Request a Quote</a></nav></div>
  </header>
  <main id="main-content" tabindex="-1">
    <section class="page-hero"><div class="container"><p class="section__eyebrow">Get in Touch</p><h1 class="section__title">Contact Bravo Security</h1><p>Tell us what you need and our team can discuss the next steps.</p><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav></div></section>
    <section class="section contact"><div class="container contact__grid">
      <div class="contact__info"><p class="section__eyebrow">Bravo Security Network Sdn. Bhd.</p><h2 class="section__title">We’re ready to hear from you.</h2><p class="contact__lead">Contact us directly or use the enquiry form to tell us which service you need.</p>
        <ul class="contact__list">
          <li><span class="contact__ico" aria-hidden="true"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#headset"></use></svg></span><div><strong>Hotline</strong><a href="tel:+60392269786">+603 9226 9786</a></div></li>
          <li><span class="contact__ico" aria-hidden="true"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#mail"></use></svg></span><div><strong>Email</strong><a href="mailto:general.bravonetwork@gmail.com">general.bravonetwork@gmail.com</a></div></li>
          <li><span class="contact__ico" aria-hidden="true"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#message-circle"></use></svg></span><div><strong>WhatsApp</strong><a href="https://wa.me/60172441959?text=Hello%20Bravo%20Security%20Network%2C%20I%20would%20like%20to%20enquire%20about%20your%20security%20services." target="_blank" rel="noopener noreferrer">WhatsApp Us</a></div></li>
          
        </ul>
        <div class="contact__actions"><a href="https://wa.me/60172441959" class="btn btn--ghost" target="_blank" rel="noopener noreferrer"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#message-circle"></use></svg>WhatsApp Us</a></div>
      </div>
      <form class="contact__form" id="enquiry" action="contact.php" method="post">
        <p class="form__note">Customer Enquiry</p>
        <p class="form__hint">Fields marked * are required.</p>
        <?php if ($sent): ?>
          <p class="form__feedback form__feedback--success" role="status">Thank you. Your enquiry has been accepted for sending. Please contact us by WhatsApp if you need urgent assistance.</p>
        <?php endif; ?>
        <?php if ($errors !== []): ?>
          <div class="form__feedback form__feedback--error" role="alert"><p>Please review the following:</p><ul><?php foreach ($errors as $error): ?><li><?= $escape($error) ?></li><?php endforeach; ?></ul></div>
        <?php endif; ?>
        <input type="hidden" name="csrf_token" value="<?= $escape($_SESSION['contact_csrf']) ?>" />
        <div class="form__trap" aria-hidden="true"><label for="website">Leave this field empty</label><input type="text" name="website" id="website" tabindex="-1" autocomplete="off" /></div>
        <div class="field"><label for="customer_name">Company / Customer Name <span aria-hidden="true">*</span></label><input type="text" id="customer_name" name="customer_name" maxlength="120" autocomplete="organization" value="<?= $escape($values['customer_name']) ?>" required /></div>
        <div class="field"><label for="phone">Phone Number <span aria-hidden="true">*</span></label><input type="tel" id="phone" name="phone" maxlength="40" autocomplete="tel" value="<?= $escape($values['phone']) ?>" required /></div>
        <div class="field"><label for="email">Email Address <span aria-hidden="true">*</span></label><input type="email" id="email" name="email" maxlength="254" autocomplete="email" value="<?= $escape($values['email']) ?>" required /></div>
        <div class="field"><label for="service">Service Required <span aria-hidden="true">*</span></label><select id="service" name="service" required><option value="">Select a service</option><?php foreach ($services as $service): ?><option value="<?= $escape($service) ?>"<?= $values['service'] === $service ? ' selected' : '' ?>><?= $escape($service) ?></option><?php endforeach; ?></select></div>
        <div class="field"><label for="message">Message / Requirements <span class="field__optional">(optional)</span></label><textarea id="message" name="message" rows="5" maxlength="5000"><?= $escape($values['message']) ?></textarea></div>
        <button type="submit" class="btn btn--primary btn--block">Send Enquiry</button>
        <details class="form__privacy"><summary>How we use your enquiry details</summary><p>Bravo Security Network uses the name, contact details, service selection and message you provide to respond to your enquiry and prepare a quotation. Please avoid including sensitive personal information.</p><p>Your enquiry is processed through our website hosting and email services. For abuse prevention, the website temporarily stores a salted network-address identifier and request times. Contact <a href="mailto:general.bravonetwork@gmail.com">general.bravonetwork@gmail.com</a> with questions about your enquiry details or to request access or correction.</p></details>
      </form>
    </div>
    <div class="container contact__location">
      <div class="contact__location-info">
        <p class="section__eyebrow">Visit Our Office</p>
        <h2 class="section__title">Find Bravo Security Network</h2>
        <address>Tingkat 4, Blok G, Excella Business Park,<br />Jalan Ampang Putra, Taman Ampang Hilir,<br />55100 Kuala Lumpur, Malaysia.</address>
        <a class="contact__map-link" href="https://www.google.com/maps/search/?api=1&amp;query=Excella+Business+Park%2C+Jalan+Ampang+Putra%2C+Taman+Ampang+Hilir%2C+55100+Kuala+Lumpur%2C+Malaysia" target="_blank" rel="noopener noreferrer">Open location in Google Maps</a>
      </div>
      <div class="contact__map">
        <iframe title="Map showing Excella Business Park in Kuala Lumpur" src="https://maps.google.com/maps?q=Excella%20Business%20Park%2C%20Jalan%20Ampang%20Putra%2C%20Taman%20Ampang%20Hilir%2C%2055100%20Kuala%20Lumpur%2C%20Malaysia&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
    </section>
  </main>
  <footer class="footer"><div class="container footer__grid"><div class="footer__brand"><a class="footer__logo" href="index.html"><img width="104" height="104" src="assets/img/bravo-logo-104.png" alt="Bravo Security Network Sdn. Bhd. logo" class="brand__logo" /><span class="brand__name">BRAVO SECURITY</span></a><p class="footer__tag">WE GUARD. WE PROTECT. WE SECURE.</p><p class="footer__company">BRAVO SECURITY NETWORK SDN. BHD.<br />SSM: 202001040772 (1397093-X)</p></div><nav class="footer__col" aria-label="Footer navigation"><h2>Explore</h2><ul><li><a href="about.html">About Us</a></li><li><a href="services.html">Services</a></li><li><a href="contact.php">Contact Us</a></li></ul></nav><div class="footer__col"><h2>Contact</h2><ul class="footer__contact"><li><a href="tel:+60392269786">Hotline: +603 9226 9786</a></li><li><a href="mailto:general.bravonetwork@gmail.com">general.bravonetwork@gmail.com</a></li><li><a href="https://wa.me/60172441959" target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li></ul></div></div><div class="footer__bar"><div class="container"><p>&copy; <span id="year"></span> Bravo Security Network Sdn. Bhd. All rights reserved.</p></div></div><a class="back-to-top" href="#main-content"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#arrow-up"></use></svg><span>Back to top</span></a></footer>
  <a class="wa-float" href="https://wa.me/60172441959?text=Hello%20Bravo%20Security%20Network%2C%20I%20would%20like%20to%20enquire%20about%20your%20security%20services." target="_blank" rel="noopener noreferrer" aria-label="Contact Bravo Security Network on WhatsApp"><svg class="lucide" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/icons/lucide.svg#message-circle"></use></svg></a>
  <script src="assets/js/main.js" defer></script>
</body>
</html>

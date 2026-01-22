import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { embedCode: string } }
) {
  const embedCode = params.embedCode;
  
  // Return JavaScript that creates the embed
  const js = `
(function() {
  var embedCode = '${embedCode}';
  var container = document.getElementById('northstar-lead-magnet-' + embedCode);
  if (!container) return;
  
  // Fetch lead magnet data
  fetch('${process.env.NEXT_PUBLIC_API_URL}/api/lead-magnets/' + embedCode + '/data')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var magnet = data.leadMagnet;
      
      // Create embed HTML
      var html = '<div style="border: 2px solid #000; padding: 24px; background: #fff; max-width: 400px; margin: 0 auto;">' +
        '<h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">' + magnet.title + '</h3>' +
        '<p style="color: #666; margin-bottom: 16px;">' + magnet.description + '</p>' +
        '<form id="northstar-form-' + embedCode + '" style="margin-top: 16px;">' +
        '<input type="email" placeholder="Your email" required style="width: 100%; padding: 12px; border: 2px solid #000; margin-bottom: 8px; font-size: 14px;">' +
        '<button type="submit" style="width: 100%; padding: 12px; background: #000; color: #fff; font-weight: bold; border: none; cursor: pointer;">' + magnet.ctaText + '</button>' +
        '</form>' +
        '</div>';
      
      container.innerHTML = html;
      
      // Handle form submission
      document.getElementById('northstar-form-' + embedCode).addEventListener('submit', function(e) {
        e.preventDefault();
        var email = e.target.querySelector('input[type="email"]').value;
        
        fetch('${process.env.NEXT_PUBLIC_API_URL}/api/lead-magnets/' + embedCode + '/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
          container.innerHTML = '<div style="border: 2px solid #000; padding: 24px; background: #fff; text-align: center;"><p style="font-weight: bold;">Thank you! Check your email.</p></div>';
        })
        .catch(function(error) {
          alert('Something went wrong. Please try again.');
        });
      });
    })
    .catch(function(error) {
      container.innerHTML = '<p style="color: red;">Failed to load lead magnet</p>';
    });
})();
  `.trim();

  return new NextResponse(js, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}

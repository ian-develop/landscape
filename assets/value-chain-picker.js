(() => {
  document.addEventListener('click', event => {
    document.querySelectorAll('.value-chain-picker[open]').forEach(picker => {
      if (!picker.contains(event.target)) picker.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    const picker = event.target.closest('.value-chain-picker');
    if (!picker || !picker.open || event.key !== 'Escape') return;
    event.preventDefault();
    picker.open = false;
    picker.querySelector('summary').focus({preventScroll:true});
  });
})();

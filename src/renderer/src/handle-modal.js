const handleModal = () => {
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function closeAll() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('opacity-0', 'pointer-events-none');
            menu.classList.remove('opacity-100', 'pointer-events-auto');
        });
    }

    function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function hideModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    document.querySelectorAll('.option-3').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAll();
            openModal();
        });
    });

    closeModal.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideModal();
    });
};

export default handleModal;
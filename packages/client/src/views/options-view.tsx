import { Link } from '~/components/link';
import { MobileView } from '~/mobile-view';

export const OptionsView = () => {
  const clearProgress = useClearProgress();

  return (
    <MobileView>
      <div className="row items-end justify-between">
        <Link href="/" className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> Home
        </Link>
      </div>

      <div className="flex-1 col justify-center">
        <h1 className="font-extrabold text-xl">Options</h1>
      </div>

      <div className="flex-1">
        <ul className="col gap-4">
          <li>
            <button onClick={playMusic}>Play music</button>
          </li>

          <li>
            <button onClick={clearProgress}>Restart the game</button>
          </li>
        </ul>
      </div>

      <div className="flex-1"></div>
    </MobileView>
  );
};

export const useClearProgress = () => {
  return () => {
    if (window.confirm("You sure dude? You'll lose all your progress!")) {
      localStorage.setItem('levels', '{}');
      window.location.href = '/';
    }
  };
};

const playMusic = () => {
  const player1 = document.querySelector('audio') as HTMLAudioElement;
  const player2 = document.createElement('audio');

  player2.src = player1.src;

  let current = 0;

  function loop() {
    const player = current === 0 ? player1 : player2;
    const other = current === 0 ? player2 : player1;

    current++;
    current %= 2;

    other.pause();
    other.currentTime = 0;

    player.play();
    setTimeout(loop, 585169);
  }

  loop();
};

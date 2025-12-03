<div id="flex-container">
  <div id="heading">
    <img src="PlantMonitorLogo.png" alt="Pflanzenmonitor-Logo" />
    <h1>IoT Pflanzenmonitor</h1>
  </div>
  <div id="links">
    <div>
      <a href="https://github.com/StrgV/Plant-Manager">
        <img src="github.png" alt="Github" style="background-color: white; border-radius: 50%" />
      </a>
      <p>Check us out on <a href="https://www.youtube.com/@iotpflanzenmonitor">Github</a>!</p>
    </div>
    <div>
      <a href="https://www.youtube.com/@iotpflanzenmonitor">
        <img src="youtube.png" alt="Youtube" />
      </a>
      <p>Check us out on <a href="https://www.youtube.com/@iotpflanzenmonitor">Youtube</a>!</p>
    </div>
  </div>
</div>

<style>
  #flex-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  #links {
    display: flex;
    flex-direction: row;
  }
  #links div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 10rem;
  }
  #heading {
    display: flex;
    align-items: center;
  }
  #heading img {
    height: 10rem;
    margin: 2rem;
  }
  div img {
    height: 20rem;
    filter: drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.5));
  }
  h1 {
    font-size: 4rem;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
  }
  p {
    font-size: 2rem;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
  }
</style>

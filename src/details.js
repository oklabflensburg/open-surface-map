const fields = [
  ['a', 'Waldfläche', '%'],
  ['b', 'Landwirtschaftsfläche', '%'],
  ['c', 'Verkehrsfläche', '%'],
  ['d', 'Siedlungs- und Verkehrsfläche¹', '%'],
  ['e', 'Siedlungs- und Verkehrsfläche¹', 'm²/Kopf'],
];

export function showDetails(container, properties) {
  const heading = document.createElement('h2');
  heading.className = 'text-2xl font-bold px-3 py-2';
  heading.textContent = properties.f;

  const list = document.createElement('ul');
  list.className = 'p-3';
  for (const [key, label, unit] of fields) {
    const item = document.createElement('li');
    item.className = 'mb-2';
    const description = document.createElement('p');
    description.textContent = label;
    const value = document.createElement('strong');
    value.textContent = `${properties[key]} ${unit}`;
    item.append(description, value);
    list.append(item);
  }

  const footnote = document.createElement('small');
  footnote.className = 'p-3 inline-block';
  footnote.textContent = '¹ Ohne Bergbaubetrieb sowie Tagebau, Grube, Steinbruch';
  container.replaceChildren(heading, list, footnote);
  container.classList.add('mb-4');
}

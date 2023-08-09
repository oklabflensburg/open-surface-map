SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(fc.feature)
) AS data
FROM (
   SELECT jsonb_build_object(
       'type', 'Feature',
       -- 'id', pkey::text,
       'geometry', ST_AsGeoJSON(ST_Transform(a.wkb_geometry, 4326))::jsonb,
       'properties', jsonb_build_object(
          'wald_19_qm', s.wald_19_qm,
          'sied_verk_19_qm', s.sied_verk_19_qm,
          'landwirt_19_qm', s.landwirt_19_qm, 
          'verkehr_19_qm', s.verkehr_19_qm,
          'sied_verk_qm_ew_19', s.sied_verk_qm_ew_19
        )
    ) AS feature
    FROM earthsurface AS s

    JOIN admin_areas AS a
    ON a.ags = s.ags

    WHERE LOWER(a.gen) = 'flensburg'
) AS fc;
